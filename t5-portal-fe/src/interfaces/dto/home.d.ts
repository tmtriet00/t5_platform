import { Task } from "../model/task";

export interface UseTaskByDateReturn {
    tasks: Task[];
    weekTotal: string;
    loading: boolean;
    error: Error | null;
}
