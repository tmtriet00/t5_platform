import { Project } from "./project";
import { TimeEntry } from "./time-entry";

export interface Task {
    id: number;
    name: string;
    project?: Project;
    project_id?: number;
    time_entries?: TimeEntry[];
}

export interface TaskWithDuration {
    id: number;
    name: string;
    project?: Project;
    tags: string[];
    totalDuration: string;
    timeEntries: TimeEntry[];
    startTime: string;
    endTime: string;
}
