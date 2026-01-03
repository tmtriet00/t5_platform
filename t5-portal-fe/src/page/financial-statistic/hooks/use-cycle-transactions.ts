import { useList } from "@refinedev/core";

interface UseCycleTransactionsProps {
    cycleStartTime?: string;
    cycleEndTime?: string;
}

export const useCycleTransactions = ({ cycleStartTime, cycleEndTime }: UseCycleTransactionsProps) => {
    const { query } = useList({
        resource: "transactions",
        filters: cycleStartTime && cycleEndTime ? [
            {
                field: "transaction_time",
                operator: "gte",
                value: cycleStartTime,
            },
            {
                field: "transaction_time",
                operator: "lte",
                value: cycleEndTime,
            },
        ] : [],
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "transaction_time",
                order: "desc",
            },
        ],
        queryOptions: {
            enabled: !!cycleStartTime && !!cycleEndTime,
        }
    });

    console.log('err', "query.error", query.error)

    return {
        transactions: query?.data?.data || [],
        loading: query?.isLoading,
        refetch: query?.refetch,
    };
};
