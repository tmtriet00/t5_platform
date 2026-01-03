export interface FinancialStatisticDto {
    id: number;
    name: string;
    current_balance: number;
    current_month_debit: number;
    current_month_credit: number;
    display_currency: string;
}
