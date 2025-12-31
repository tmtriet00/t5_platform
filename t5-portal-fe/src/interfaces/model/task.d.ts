import { Project } from "./project";
import { TimeEntry } from "./time-entry";
import { TaskEstimation } from "./task-estimation";

export interface Task {
    id: number;
    name: string;
    project?: Project;
    project_id?: number;
    time_entries?: TimeEntry[];
    risk_type?: 'low' | 'medium' | 'high';
    status?: 'new' | 'in_progress' | 'completed' | 'canceled' | 'blocked';
    task_type?: 'work' | 'break';
    note?: string;
    task_estimations?: TaskEstimation[];
}
