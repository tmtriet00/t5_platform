import { Project } from "./project";
import { TimeEntry } from "./time-entry";

export interface Task {
    id: number;
    name: string;
    project?: Project;
    project_id?: number;
    time_entries?: TimeEntry[];
    risk_type?: string;
    status?: 'new' | 'in_progress' | 'completed' | 'canceled' | 'blocked';
}
