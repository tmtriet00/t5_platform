export interface FinancialStatisticDto {
    id: number;
    name: string;
    current_balance: number;
    current_month_debit: number;
    current_month_credit: number;
    display_currency: string;
    maximum_expense_amount: number;
    maximum_expense_currency: string;
}
