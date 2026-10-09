import type { Payment } from '../types';
import { lastNMonthKeys, monthKey, monthLabel } from './formatters';

export function earningsSummary(payments: Payment[]) {
  const active = payments.filter((p) => p.status !== 'Refunded');
  const completed = active.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const pending = active.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const thisMonth = monthKey(new Date().toISOString());
  const month = active.filter((p) => monthKey(p.date) === thisMonth).reduce((s, p) => s + p.amount, 0);
  const series = lastNMonthKeys(6).map((k) => ({
    month: monthLabel(k),
    amount: active.filter((p) => monthKey(p.date) === k).reduce((s, p) => s + p.amount, 0),
  }));
  return { total: completed + pending, completed, pending, month, series };
}
