export interface TaskSummaryDto {
    id: number;
    name: string;
    project_name?: string;
    time_entry_count?: number;
    time_entry_total_duration?: number;
    time_entry_total_duration_in_date?: number;
    time_entry_active_duration?: number;
    tags?: string[];
    status?: 'new' | 'in_progress' | 'completed' | 'canceled' | 'blocked';
    risk_type?: string;
    total_estimation_time?: number;
}
