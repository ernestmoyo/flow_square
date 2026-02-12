import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy');
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy HH:mm');
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

export function formatVolume(value: number, unit = 'm\u00B3'): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ${unit}`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ${unit}`;
  return `${value.toFixed(1)} ${unit}`;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
