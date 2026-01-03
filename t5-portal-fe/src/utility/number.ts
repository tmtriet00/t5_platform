export const roundDecimal = (number: number, decimalPlaces: number) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
};

export const formatCurrency = ({
    amount,
    currency
}: {
    amount: number;
    currency: string;
}) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};