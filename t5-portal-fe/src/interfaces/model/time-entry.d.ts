import { Task } from "./task";

export interface TimeEntry {
    id: number;
    description: string;
    task_id: string;
    task?: Task;
    tags?: string[];
    start_time: string;
    end_time: string | null;
}
