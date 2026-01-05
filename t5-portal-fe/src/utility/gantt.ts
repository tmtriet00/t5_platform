import { ITask } from "@svar-ui/react-gantt";

export const correctParentDates = (tasks: ITask[]) => {
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
            task.start = new Date(minStart);
        }
        if (maxEnd !== null) {
            task.end = new Date(maxEnd);
        }

        if (minStart !== null && maxEnd !== null) {
            const diffTime = Math.abs(maxEnd - minStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            task.duration = diffDays;
        }

        // Also ensure duration is consistent if needed, but standard usually computes it or allows mismatch.
        // We just leave it as requested.

        processed.add(taskId);
    };

    tasks.forEach(t => t.id && process(t.id));

    return [...tasks];
};
