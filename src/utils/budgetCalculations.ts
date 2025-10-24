import { BudgetProgress } from '../types';

/**
 * Calculate budget progress and status
 * @param spent Amount spent in the category
 * @param budget Budget amount for the category
 * @param category Category name
 * @returns BudgetProgress object with percentage, status, and remaining amount
 */
export function calculateBudgetProgress(
  spent: number,
  budget: number,
  category: string
): BudgetProgress {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  let status: BudgetProgress['status'];
  if (percentage >= 100) {
    status = 'over';
  } else if (percentage >= 90) {
    status = 'critical';
  } else if (percentage >= 80) {
    status = 'warning';
  } else {
    status = 'healthy';
  }

  return {
    category,
    budget,
    spent,
    percentage: Math.min(percentage, 100), // Cap at 100% for display
    status,
    remaining,
  };
}

/**
 * Get color for budget status
 */
export function getBudgetStatusColor(status: BudgetProgress['status']): string {
  switch (status) {
    case 'healthy':
      return '#10b981'; // green
    case 'warning':
      return '#f59e0b'; // yellow
    case 'critical':
      return '#ef4444'; // red
    case 'over':
      return '#991b1b'; // dark red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get emoji for budget status
 */
export function getBudgetStatusEmoji(status: BudgetProgress['status']): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '🔴';
    case 'over':
      return '🚨';
    default:
      return '⚪';
  }
}

/**
 * Check if budget needs alert
 */
export function shouldAlertBudget(percentage: number): boolean {
  return percentage >= 80;
}

/**
 * Get alert message for budget status
 */
export function getBudgetAlertMessage(
  category: string,
  percentage: number
): string | null {
  if (percentage >= 100) {
    return `🚨 You've exceeded your ${category} budget!`;
  } else if (percentage >= 90) {
    return `🔴 Warning: ${category} budget is at ${percentage.toFixed(0)}%`;
  } else if (percentage >= 80) {
    return `⚠️ Heads up: ${category} budget is at ${percentage.toFixed(0)}%`;
  }
  return null;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Parse month string to display format
 */
export function formatMonthDisplay(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
