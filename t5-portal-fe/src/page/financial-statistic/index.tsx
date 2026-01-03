import { useFinancialStatistic } from "./hooks/use-financial-statistic";
import { AgCharts } from 'ag-charts-react';
import { AgChartOptions } from 'ag-charts-enterprise';
import { Card, Col, Row, Spin } from "antd";
import { useMemo } from "react";
import { formatCurrency, roundDecimal } from "utility/number";
import { CycleTransactionTable } from "./components/cycle-transaction-table";

export const FinancialStatistic = () => {
    const { financialStatistics, loading } = useFinancialStatistic();

    const maximumExpenseAmount = financialStatistics?.[0]?.maximum_expense_amount ?? 0
    const maximumExpenseCurrency = financialStatistics?.[0]?.maximum_expense_currency ?? 'VND'
    const totalCurrentCycleDebit = financialStatistics?.reduce((total, item) => total + item.current_cycle_debit, 0) ?? 0
    const totalCurrentCycleCredit = financialStatistics?.reduce((total, item) => total + item.current_cycle_credit, 0) ?? 0
    const displayCurrency = financialStatistics?.[0]?.display_currency ?? 'VND'
    const cycleStartTime = financialStatistics?.[0]?.cycle_start_time
    const cycleEndTime = financialStatistics?.[0]?.cycle_end_time
    const wishListTotalCost = financialStatistics?.[0]?.wish_list_total_cost ?? 0
    const actualDebit = totalCurrentCycleDebit + wishListTotalCost

    const chartOptions = useMemo<AgChartOptions>(() => {
        const data = financialStatistics.filter(item => item.current_balance > 0);
        return {
            data: data,
            series: [
                {
                    type: 'pie',
                    angleKey: 'current_balance',
                    legendItemKey: 'name',
                    calloutLabelKey: 'name',
                    sectorLabelKey: 'current_balance',
                    sectorLabel: {
                        formatter: ({ value }) => {
                            return formatCurrency({ amount: value, currency: displayCurrency });
                        }
                    }
                },
            ],
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
        };
    }, [financialStatistics]);

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Top Section */}
            <Row gutter={[16, 16]}>
                {/* Left: Pie Chart */}
                <Col xs={24} md={8}>
                    <Card title="Financial Breakdown" style={{ height: '100%' }}>
                        <AgCharts options={chartOptions} />
                    </Card>
                </Col>

                {/* Right: Empty Card */}
                <Col xs={24} md={16}>
                    <Card title="Cycle Statistic" style={{ height: '100%' }} extra={
                        <div className="flex flex-row gap-2">
                            <div>
                                <span>Maximum Expense:</span>
                                <span>{formatCurrency({ amount: maximumExpenseAmount, currency: maximumExpenseCurrency })}</span>
                            </div>
                            <div>
                                <span>Current Cycle Debit:</span>
                                <span>{formatCurrency({ amount: totalCurrentCycleDebit, currency: displayCurrency })} ({roundDecimal(totalCurrentCycleDebit / maximumExpenseAmount * 100, 2)}%)</span>
                            </div>
                            <div>
                                <span>Actual Debit:</span>
                                <span>{formatCurrency({ amount: actualDebit, currency: displayCurrency })} ({roundDecimal(actualDebit / maximumExpenseAmount * 100, 2)}%)</span>
                            </div>
                        </div>
                    }>
                        <CycleTransactionTable
                            cycleStartTime={cycleStartTime}
                            cycleEndTime={cycleEndTime}
                            displayCurrency={displayCurrency}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bottom Section: Placeholder for Line Chart */}
            <div style={{ marginTop: '24px' }}>
                <Card title="Trend Analysis">
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        Line Chart Placeholder (Coming Soon)
                    </div>
                </Card>
            </div>
        </div >
    )
}