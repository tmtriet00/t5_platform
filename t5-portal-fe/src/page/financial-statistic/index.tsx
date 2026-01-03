import { useFinancialStatistic } from "./hooks/use-financial-statistic";
import { AgCharts } from 'ag-charts-react';
import { AgChartOptions } from 'ag-charts-enterprise';
import { Card, Col, Row, Spin } from "antd";
import { useMemo } from "react";

export const FinancialStatistic = () => {
    const { financialStatistics, loading } = useFinancialStatistic();

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
                            if (!financialStatistics.length) return '';
                            // Assuming all items have the same currency for display, picking the first one or default
                            const currency = financialStatistics[0]?.display_currency || '';
                            return `${value.toLocaleString()} ${currency}`;
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
                <Col xs={24} md={12}>
                    <Card title="Financial Composition" style={{ minHeight: '500px' }}>
                        <div style={{ height: '400px' }}>
                            <AgCharts options={chartOptions} />
                        </div>
                    </Card>
                </Col>

                {/* Right: Empty Card */}
                <Col xs={24} md={12}>
                    <Card title="Future Statistic" style={{ height: '100%', minHeight: '500px' }}>
                        {/* Empty for now */}
                    </Card>
                </Col>
            </Row>

            {/* Bottom Section: Placeholder for Line Chart */}
            <div style={{ marginTop: '24px' }}>
                <Card title="Trend Analysis">
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        Line Chart Placeholder
                    </div>
                </Card>
            </div>
        </div>
    )
}