import { TaskEvent } from "interfaces/dto/task";
import { Task } from "../interfaces/model/task";
import dayjs from "dayjs";
import { rrulestr } from 'rrule';

export const sortWorkTaskByPriority = (tasks: Task[]): Task[] => {
    const riskToScore = {
        high: 1,
        medium: 2,
        low: 3
    }

    tasks.sort((a, b) => {
        const riskA = riskToScore[a.risk_type || 'low']
        const riskB = riskToScore[b.risk_type || 'low']

        if (riskA != riskB) {
            return riskA - riskB
        }

        if (a.remaining_time != b.remaining_time) {
            return (a.remaining_time ?? 0) - (b.remaining_time ?? 0)
        }

        if (a.priority_score != b.priority_score) {
            return (a.priority_score ?? 0) - (b.priority_score ?? 0)
        }

        return a.id.localeCompare(b.id)
    })

    return tasks
}

export const processWorkTask = (tasks: Task[]): TaskEvent[] => {
    const sortedTasks = sortWorkTaskByPriority(tasks)
    const processTaskEvents: TaskEvent[] = []

    let accumulatedTime = dayjs().startOf('minute')

    for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i]

        const taskEvent: TaskEvent = {
            task_id: task.id,
            title: task.name,
            start: accumulatedTime.toDate(),
            end: accumulatedTime.add(task.remaining_time || 0, 'second').toDate(),
            backgroundColor: "blue",
            ...(task.due_time ? { due: dayjs(task.due_time).toDate() } : {})
        }
        accumulatedTime = accumulatedTime.add(task.remaining_time || 0, 'second').add(1, 'minute')
        processTaskEvents.push(taskEvent)
    }

    return processTaskEvents
}

export const processSleepTask = (tasks: Task[]): TaskEvent[] => {
    const processTaskEvents: TaskEvent[] = []

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const taskStartTime = dayjs(task.start_time || '')

        const taskEvent: TaskEvent = {
            task_id: task.id,
            title: task.name,
            start: taskStartTime.toDate(),
            end: taskStartTime.add(task.remaining_time || 0, 'second').toDate(),
            backgroundColor: "green"
        }
        processTaskEvents.push(taskEvent)
    }

    return processTaskEvents
}


export const expandRecurringEvents = (event: TaskEvent, recurrent_rule: string, rangeStart: Date, rangeEnd: Date): TaskEvent[] => {
    const expandedEvents: TaskEvent[] = [];

    try {
        // Handle RRule string being just the rule part vs full string
        const ruleString = recurrent_rule;
        if (!ruleString.startsWith('DTSTART')) {
            // If DTSTART is missing, we might need to prepend it or configure it
            // The rrule library often parses without DTSTART if options are passed, 
            // or we construct it via options.
            // However, fullcalendar/rrule often saves just the rule part.
            // Let's assume standard RRULE string format.
            // If we use rrulestr, we can pass dtstart in options if it's missing in string
        }

        // We use rrulestr for flexibility
        const rule = rrulestr(ruleString, {
            dtstart: new Date(event.start) // Fallback start date if not in string
        });

        const instances = rule.between(rangeStart, rangeEnd, true); // true = inclusive

        const duration = dayjs(event.end).diff(dayjs(event.start));

        for (const date of instances) {
            expandedEvents.push({
                ...event,
                start: date,
                end: dayjs(date).add(duration, 'millisecond').toDate(),
            });
        }
    } catch (e) {
        console.error('Failed to parse rrule for event:', event, e);
        // Fallback: keep original event
        expandedEvents.push(event);
    }

    return expandedEvents;
}

export const fillTheGapOfBaseTaskEvents = (baseTaskEvents: TaskEvent[], newTaskEvents: TaskEvent[], minDurationMinutes: number = 10): TaskEvent[] => {
    const sortedBaseEvents = [...baseTaskEvents].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
    const resultEvents: TaskEvent[] = [];
    const minDurationSeconds = minDurationMinutes * 60;

    if (newTaskEvents.length === 0) return baseTaskEvents;

    let currentScheduleTime = dayjs(newTaskEvents[0].start);

    for (const task of newTaskEvents) {
        let taskDurationSeconds = dayjs(task.end).diff(dayjs(task.start), 'second');

        while (taskDurationSeconds > 0) {
            // 1. Skip over any blocked time in base events
            let isBlocked = true;
            while (isBlocked) {
                isBlocked = false;
                for (const baseEvent of sortedBaseEvents) {
                    const baseStart = dayjs(baseEvent.start);
                    const baseEnd = dayjs(baseEvent.end);

                    const bufferedStart = baseStart.subtract(1, 'minute');

                    if (
                        (currentScheduleTime.isSame(bufferedStart) || currentScheduleTime.isAfter(bufferedStart)) &&
                        currentScheduleTime.isBefore(baseEnd)
                    ) {
                        currentScheduleTime = baseEnd.add(1, 'minute');
                        isBlocked = true;
                        // Restart check since we moved time potentially into another event
                        break;
                    }
                }
            }

            // 2. Find next nearest base event
            const futureEvents = sortedBaseEvents.filter(e => dayjs(e.start).isAfter(currentScheduleTime));
            let timeToNextBlock = Infinity;

            if (futureEvents.length > 0) {
                timeToNextBlock = dayjs(futureEvents[0].start).diff(currentScheduleTime, 'second') - 60;
            }

            // Check if loop gap is valid (>= minDurationMinutes)
            if (timeToNextBlock < minDurationSeconds) {
                if (futureEvents.length > 0) {
                    currentScheduleTime = dayjs(futureEvents[0].end).add(1, 'minute');
                    continue;
                }
            }

            // 3. Determine how much we can fit
            const durationToBook = Math.min(taskDurationSeconds, timeToNextBlock);

            if (durationToBook >= minDurationSeconds) {
                const partStart = currentScheduleTime.toDate();
                const partEnd = currentScheduleTime.add(durationToBook, 'second').toDate();

                resultEvents.push({
                    ...task,
                    start: partStart,
                    end: partEnd
                });

                currentScheduleTime = dayjs(partEnd).add(1, 'minute');
                taskDurationSeconds -= durationToBook;
            } else {
                // If remaining duration is smaller than minDuration, discard it
                break;
            }
        }
    }

    return [...baseTaskEvents, ...resultEvents];
}



export const convertTaskToEvent = (tasks: Task[]): TaskEvent[] => {
    const uncompleteWorkTasks = tasks.filter((task) => task.task_type === 'work' && task.status !== 'completed');
    const sleepTasks = tasks.filter((task) => task.task_type === 'sleep');

    const processedWorkTaskEvents = processWorkTask(uncompleteWorkTasks)
    const processedSleepTaskEvents = processSleepTask(sleepTasks)

    const resultEvents = fillTheGapOfBaseTaskEvents(processedSleepTaskEvents, processedWorkTaskEvents)

    const processedRiskEvents = findDueTaskEvents(resultEvents)

    processedRiskEvents.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    return processedRiskEvents
}

export const findDueTaskEvents = (events: TaskEvent[]): TaskEvent[] => {
    // Group events by task_id
    const eventsByTask: Record<string, TaskEvent[]> = {};
    for (const event of events) {
        if (!event.task_id) continue;
        if (!eventsByTask[event.task_id]) {
            eventsByTask[event.task_id] = [];
        }
        eventsByTask[event.task_id].push(event);
    }

    const processedEvents = [...events];

    // Iterate through each task group
    for (const taskId in eventsByTask) {
        const taskEvents = eventsByTask[taskId];

        // Find the max end date for this task
        let maxEndDate = dayjs(taskEvents[0].end);
        let due: Date | undefined = undefined;

        for (const event of taskEvents) {
            if (dayjs(event.end).isAfter(maxEndDate)) {
                maxEndDate = dayjs(event.end);
            }
            if (event.due) {
                due = event.due;
            }
        }

        // If due date exists and max end date > due date, mark as risk
        if (due && maxEndDate.isAfter(dayjs(due))) {
            const delay = maxEndDate.diff(dayjs(due), 'second'); // Calculate delay in seconds

            // Update all events for this task
            for (const event of processedEvents) {
                if (event.task_id === taskId) {
                    event.backgroundColor = 'red';
                    event.delay = delay;
                }
            }
        }
    }

    return processedEvents;
}