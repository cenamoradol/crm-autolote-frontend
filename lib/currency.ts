export function formatPrice(amount: number | string | any, currencySymbol: string = '$', currencyCode: string = 'USD'): string {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');

    // Si la moneda es HNL, el formato común en Honduras es "L. 500.00" o "L 500.00"
    // Para otros usamos el formato estándar

    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);

    return `${currencySymbol}${formatted}`;
}
