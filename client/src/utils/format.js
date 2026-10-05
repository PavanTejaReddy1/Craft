import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatBudget = (min, max, currency = 'INR') => {
  if (min === max) return formatCurrency(min, currency);
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy');
  } catch {
    return '—';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatDelivery = (days) => {
  if (!days) return '—';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '1 week';
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

export const truncate = (str, length = 120) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '…' : str;
};

export const pluralize = (count, singular, plural) => {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
