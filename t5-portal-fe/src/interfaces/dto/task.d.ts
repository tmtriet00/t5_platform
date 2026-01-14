export interface TaskSummaryDto {
    id: string;
    name: string;
    project_name?: string;
    time_entry_count?: number;
    time_entry_total_duration?: number;
    time_entry_total_duration_in_date?: number;
    time_entry_active_duration?: number;
    tags?: string[];
    status?: 'new' | 'in_progress' | 'completed' | 'canceled' | 'blocked';
    risk_type?: 'low' | 'medium' | 'high';
    total_estimation_time?: number;
    task_type?: 'work' | 'break';
    latest_time_entry_start_time?: string;
}

export interface TaskEvent {
    task_id: string;
    title: string;
    start: Date;
    end: Date;
    due?: Date;
    backgroundColor: string;
    delay?: number
}