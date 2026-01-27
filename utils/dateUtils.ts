import { Assignment } from '../types';

export const getMonthList = (start: string, end: string): string[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const list: string[] = [];
  
  const current = new Date(startDate);
  current.setDate(1); // Set to first of month

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    list.push(`${year}-${month}`);
    current.setMonth(current.getMonth() + 1);
  }
  return list;
};

export const calculateMM = (start: string, end: string, ratio: number = 1.0): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (endDate < startDate) return 0;

  // Approximate diff in months
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  
  // Standard PMO estimation: 30 days = 1 MM roughly, or 20-22 working days.
  // We will use a standard 20 working day month for calculation or simple 30 day calendar.
  // Let's use 30.4 days (avg)
  
  const mm = (diffDays / 30.4) * ratio;
  return parseFloat(mm.toFixed(2));
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

export const generateId = () => Math.random().toString(36).substr(2, 9);