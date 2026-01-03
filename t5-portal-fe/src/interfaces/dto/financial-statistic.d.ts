export interface FinancialStatisticDto {
    id: number;
    name: string;
    current_balance: number;
    current_cycle_debit: number;
    current_cycle_credit: number;
    display_currency: string;
    maximum_expense_amount: number;
    maximum_expense_currency: string;
    cycle_start_time: string;
    cycle_end_time: string;
}
