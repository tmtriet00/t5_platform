export interface EmergencyKit {
    id: number;
    user_id: string; // Assuming user ownership
    reason: string;  // BlockNote content (JSON string)
    note: string; // BlockNote content (JSON string)
    created_at: string;
}
