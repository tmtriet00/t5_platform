
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { RRule, rrulestr } from 'https://esm.sh/rrule@2.7.2'
import { AuthMiddleware } from "../../shared/jwt.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    return AuthMiddleware(req, async (req) => {
        try {
            console.log("Starting clone task function...")

            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            // Get request body for optional timezone, default to UTC if not provided
            // In a real scenario, we might want to pass the user's timezone from the client
            let { timezone, lookup_size } = await req.json().catch(() => ({ timezone: 'UTC', lookup_size: 0 }))
            if (!timezone) timezone = 'UTC'

            // 1. Find all tasks with non-empty rrule
            const { data: parents, error: fetchError } = await supabase
                .from('tasks')
                .select('*')
                .neq('rrule', null)
                .neq('rrule', '')

            if (fetchError) throw fetchError

            const results = []
            let newTasksCount = 0

            // Calculate "Today" in the target timezone
            // For simplicity, we'll use the server's current time and assume the rrule should be checked for "now" or "today"
            // If we want strict "Today in User Timezone", we'd need a library like date-fns-tz or similar, 
            // but for now let's define the window as current timestamp +/- 24 hours to match any potential "today"
            // Or better: Just check for occurrences that *should* exist by now but don't.

            // Actually, the requirement is "how many children task should be exist today". 
            // Let's define the window:
            const now = new Date()
            // Start of day (UTC approx or just use a wide window for safety?)
            // Use the provided timezone offset if possible, but JS Date in Deno is UTC.
            // Let's rely on RRule to give us instances. 
            // We will look for instances that fall within the current day (server time)

            const startOfDay = new Date(now)
            startOfDay.setDate(startOfDay.getDate() - lookup_size)
            startOfDay.setUTCHours(0, 0, 0, 0)

            const endOfDay = new Date(now)
            endOfDay.setDate(endOfDay.getDate() + lookup_size)
            endOfDay.setUTCHours(23, 59, 59, 999)

            console.log(`Processing ${parents?.length} repeating tasks with time zone ${timezone} and lookup size ${lookup_size}...`)
            console.log(`Time window: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`)

            for (const parent of parents || []) {
                try {
                    const ruleOptions = RRule.parseString(parent.rrule)
                    // Ensure dtstart is set correctly from parent's start_time if not in rrule string
                    if (!ruleOptions.dtstart && parent.start_time) {
                        ruleOptions.dtstart = new Date(parent.start_time)
                    }

                    const rule = new RRule(ruleOptions)

                    // Get occurrences for today
                    // Note: dates in RRule are usually local unless specified. 
                    // If the RRule string rules are TZ-agnostic, they apply to "local" time.
                    // We'll treat the times as UTC for consistency in the DB.
                    const occurrences = rule.between(startOfDay, endOfDay, true) // inclusive

                    if (occurrences.length === 0) {
                        continue
                    }

                    for (const date of occurrences) {
                        // Check if child already exists
                        // We assume child task has same title? Or just link by parent_task_id and start_time?
                        // Checking strictly by parent_task_id and start_time (approximate match?)

                        // Exact match check
                        const { data: existing, error: checkError } = await supabase
                            .from('tasks')
                            .select('id')
                            .eq('parent_id', parent.id)
                            .eq('start_time', date.toISOString())
                            .maybeSingle()

                        if (checkError) console.error("Error checking child:", checkError)

                        if (!existing) {
                            const newStartTime = new Date(date)

                            const childTask = {
                                ...parent,
                                id: undefined, // Let DB generate ID
                                created_at: undefined,
                                parent_id: parent.id,
                                start_time: newStartTime.toISOString(),
                                rrule: null,
                                status: 'new',
                            }

                            // Remove fields that shouldn't be cloned directly if they exist in spread
                            delete childTask.id
                            delete childTask.created_at
                            delete childTask.updated_at

                            const { error: insertError } = await supabase.from('tasks').insert(childTask)
                            if (insertError) {
                                console.error(`Failed to create child for parent ${parent.id}`, insertError)
                            } else {
                                newTasksCount++
                                results.push({ parentId: parent.id, created: true, date: newStartTime })
                            }
                        } else {
                            results.push({ parentId: parent.id, created: false, date: date, reason: 'Already exists' })
                        }
                    }
                } catch (err) {
                    console.error(`Error processing task ${parent.id}:`, err)
                }
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    processed: parents?.length,
                    newChildrenCreated: newTasksCount,
                    details: results
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

        } catch (error) {
            console.error(error)
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
    })
})
