import parser from 'cron-parser'
import { Cron } from 'interfaces'

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
    schedules: Cron[],
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

            const interval = cronParser.parse(schedule.schedule, options)

            // Iterate over all occurrences in the range
             
            while (true) {
                try {
                    const obj = interval.next()
                    const date = obj.toDate()

                    const endDate = new Date(date)
                    endDate.setMinutes(
                        endDate.getMinutes() + 60
                    )

                    events.push({
                        id: `${schedule.jobid}-${date.getTime()}`, // Unique ID for each instance
                        title: schedule.jobname,
                        start: date.toISOString(),
                        end: endDate.toISOString(),
                        backgroundColor: '#108ee9', // Default blue color
                    })
                } catch (e) {
                    // Done iterating
                    break
                }
            }
        } catch (err) {
            console.error(
                `Failed to parse cron schedule: ${schedule.schedule} for ${schedule.jobname}`,
                err
            )
        }
    })

    return events
}
