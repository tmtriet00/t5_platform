export interface TaskSummaryDto {
    id: number;
    name: string;
    project_name?: string;
    time_entry_count?: number;
    time_entry_total_duration?: number;
    tags?: string[];
}
