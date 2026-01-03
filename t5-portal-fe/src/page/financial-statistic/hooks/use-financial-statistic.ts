import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from 'utility';
import { FinancialStatisticDto } from 'interfaces/dto/financial-statistic';

export const useFinancialStatistic = () => {
    const { data: financialStatistics, isLoading, error } = useQuery<FinancialStatisticDto[], Error>({
        queryKey: ['get_financial_stats'],
        queryFn: async () => {
            const { data, error } = await supabaseClient.rpc("get_financial_stats", {
                in_timezone: "+07:00",
                in_display_currency: "VND"
            });

            if (error) {
                throw error;
            }
            return data as FinancialStatisticDto[];
        },
        refetchInterval: 1000
    });

    return {
        financialStatistics: financialStatistics || [],
        loading: isLoading,
        error: error as Error | null
    };
};
