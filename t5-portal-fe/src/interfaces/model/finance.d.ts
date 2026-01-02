export interface FinanceCheckinRecord {
    id: number;
    balance: number;
    currency: string;
    ledger_id: number;
    created_at: string;
    updated_at: string;
    ledger?: {
        id: number;
        name: string;
    };
}
