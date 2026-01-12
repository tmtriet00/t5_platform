import { TaskEvent } from "interfaces/dto/task";
import { Task } from "../interfaces/model/task";
import dayjs from "dayjs";

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

        return a.id - b.id
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
            title: task.name,
            start: accumulatedTime.toDate(),
            end: accumulatedTime.add(task.remaining_time || 0, 'second').toDate(),
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
            title: task.name,
            start: taskStartTime.toDate(),
            end: taskStartTime.add(task.remaining_time || 0, 'second').toDate(),
        }
        processTaskEvents.push(taskEvent)
    }

    return processTaskEvents
}

export const fillTheGapOfBaseTaskEvents = (baseTaskEvents: TaskEvent[], newTaskEvents: TaskEvent[]): TaskEvent[] => {
    const sortedBaseEvents = [...baseTaskEvents].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
    const resultEvents: TaskEvent[] = [];

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

            // 3. Determine how much we can fit
            const durationToBook = Math.min(taskDurationSeconds, timeToNextBlock);

            if (durationToBook > 0) {
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
                // Safety break to prevent infinite loops if something is wrong with diff
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

    resultEvents.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    return resultEvents
}