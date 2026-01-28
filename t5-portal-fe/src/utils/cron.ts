import parser from 'cron-parser'

export interface CronSchedule {
    id: string
    title: string
    cron: string // e.g., "0 9 * * *"
    durationMinutes?: number // Default to 60 if not specified
    color?: string
}

export interface CalendarEvent {
    id: string
    title: string
    start: string // ISO string
    end: string // ISO string
    backgroundColor?: string
}

/**
 * Converts a list of cron schedules into calendar events within a given date range.
 * @param schedules List of cron schedules
 * @param start Start of the range
 * @param end End of the range
 * @returns List of CalendarEvents
 */
export const convertCronToEvents = (
    schedules: CronSchedule[],
    start: Date,
    end: Date
): CalendarEvent[] => {
    const events: CalendarEvent[] = []

    // specific hack for cron-parser import in this environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cronParser: any = (parser as any).default || parser

    schedules.forEach((schedule) => {
        try {
            const options = {
                currentDate: start,
                endDate: end,
                iterator: true,
            }

            const interval = cronParser.parse(schedule.cron, options)

            // Iterate over all occurrences in the range
             
            while (true) {
                try {
                    const obj = interval.next()
                    const date = obj.toDate()

                    const endDate = new Date(date)
                    endDate.setMinutes(
                        endDate.getMinutes() + (schedule.durationMinutes || 60)
                    )

                    events.push({
                        id: `${schedule.id}-${date.getTime()}`, // Unique ID for each instance
                        title: schedule.title,
                        start: date.toISOString(),
                        end: endDate.toISOString(),
                        backgroundColor: schedule.color,
                    })
                } catch {
                    // Done iterating
                    break
                }
            }
        } catch (err) {
            console.error(
                `Failed to parse cron schedule: ${schedule.cron} for ${schedule.title}`,
                err
            )
        }
    })

    return events
}
