export interface TaskEstimation {
    id: number;
    task_id: number;
    estimation_type?: 'research' | 'other';
    estimation_time: number;
    created_at: string;
    updated_at: string;
}
