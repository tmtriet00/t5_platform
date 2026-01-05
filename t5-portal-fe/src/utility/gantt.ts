import { ITask } from "@svar-ui/react-gantt";

export const extendTask = (tasks: ITask[]) => {
    const taskMap = new Map<string | number, ITask>();
    tasks.forEach(t => {
        if (t.id) taskMap.set(t.id, t);
    });

    const childrenMap = new Map<string | number, ITask[]>();
    tasks.forEach(t => {
        if (t.parent) {
            if (!childrenMap.has(t.parent)) {
                childrenMap.set(t.parent, []);
            }
            childrenMap.get(t.parent)?.push(t);
        }
    });

    const processed = new Set<string | number>();

    const getDate = (d: Date | string | undefined) => d ? new Date(d) : null;

    const process = (taskId: string | number) => {
        if (processed.has(taskId)) return;

        const task = taskMap.get(taskId);
        if (!task) return;

        const children = childrenMap.get(taskId);

        if (!children || children.length === 0) {
            processed.add(taskId);
            return;
        }

        // Process children first
        children.forEach(child => child.id && process(child.id));

        // Now calculate min start and max end from children
        let minStart: number | null = null;
        let maxEnd: number | null = null;

        children.forEach(child => {
            if (!child.id) return;
            const childTask = taskMap.get(child.id); // Get updated child
            if (childTask) {
                const s = getDate(childTask.start)?.getTime();
                const e = getDate(childTask.end)?.getTime();

                if (s !== undefined && s !== null && !isNaN(s)) {
                    if (minStart === null || s < minStart) minStart = s;
                }
                if (e !== undefined && e !== null && !isNaN(e)) {
                    if (maxEnd === null || e > maxEnd) maxEnd = e;
                }
            }
        });

        if (minStart !== null) {
            const currentStart = getDate(task.start)?.getTime();
            // Only extend if child starts earlier than parent
            if (currentStart === undefined || currentStart === null || isNaN(currentStart) || minStart < currentStart) {
                task.start = new Date(minStart);
            }
        }
        if (maxEnd !== null) {
            const currentEnd = getDate(task.end)?.getTime();
            // Only extend if child ends later than parent
            if (currentEnd === undefined || currentEnd === null || isNaN(currentEnd) || maxEnd > currentEnd) {
                task.end = new Date(maxEnd);
            }
        }

        // Recalculate duration based on new (or existing) start/end
        const finalStart = getDate(task.start)?.getTime();
        const finalEnd = getDate(task.end)?.getTime();

        if (finalStart !== undefined && finalStart !== null && !isNaN(finalStart) &&
            finalEnd !== undefined && finalEnd !== null && !isNaN(finalEnd)) {
            const diffTime = Math.abs(finalEnd - finalStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            task.duration = diffDays;
        }

        processed.add(taskId);
    };

    tasks.forEach(t => t.id && process(t.id));

    return [...tasks];
};
