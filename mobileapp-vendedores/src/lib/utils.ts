export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCOPShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `$ ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$ ${(amount / 1_000).toFixed(0)}k`;
  }
  return `$ ${amount.toFixed(0)}`;
}
