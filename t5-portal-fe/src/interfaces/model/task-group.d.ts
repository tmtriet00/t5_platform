import { TaskWithDuration } from "./task";

export interface TaskGroup {
    dateLabel: string;
    totalDuration: string;
    tasks: TaskWithDuration[];
}
