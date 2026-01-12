import { Project } from "./project";
import { TimeEntry } from "./time-entry";
import { TaskEstimation } from "./task-estimation";

export interface Task {
    id: string;
    name: string;
    project?: Project;
    project_id?: number;
    time_entries?: TimeEntry[];
    risk_type?: 'low' | 'medium' | 'high';
    status?: 'new' | 'in_progress' | 'completed' | 'canceled' | 'blocked';
    task_type?: 'work' | 'break' | 'sleep';
    note?: string;
    task_estimations?: TaskEstimation[];
    due_time?: string | null;
    start_time?: string | null;
    rrule?: string;
    remaining_time?: number;
    priority_score?: number;
}
