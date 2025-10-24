import {
  calculateBudgetProgress,
  getBudgetStatusColor,
  getBudgetStatusEmoji,
  shouldAlertBudget,
  getBudgetAlertMessage,
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
  formatMonthDisplay,
} from '../budgetCalculations';

describe('Budget Calculations', () => {
  describe('calculateBudgetProgress', () => {
    it('should calculate healthy status when under 80%', () => {
      const result = calculateBudgetProgress(300, 500, 'Food');
      
      expect(result.category).toBe('Food');
      expect(result.budget).toBe(500);
      expect(result.spent).toBe(300);
      expect(result.percentage).toBe(60);
      expect(result.status).toBe('healthy');
      expect(result.remaining).toBe(200);
    });

    it('should calculate warning status when between 80-90%', () => {
      const result = calculateBudgetProgress(425, 500, 'Food');
      
      expect(result.percentage).toBe(85);
      expect(result.status).toBe('warning');
    });

    it('should calculate critical status when between 90-100%', () => {
      const result = calculateBudgetProgress(475, 500, 'Food');
      
      expect(result.percentage).toBe(95);
      expect(result.status).toBe('critical');
    });

    it('should calculate over status when exceeding budget', () => {
      const result = calculateBudgetProgress(600, 500, 'Food');
      
      expect(result.percentage).toBe(100); // Capped at 100 for display
      expect(result.status).toBe('over');
      expect(result.remaining).toBe(-100);
    });

    it('should handle zero budget', () => {
      const result = calculateBudgetProgress(100, 0, 'Food');
      
      expect(result.percentage).toBe(0);
      expect(result.status).toBe('healthy');
    });
  });

  describe('getBudgetStatusColor', () => {
    it('should return green for healthy status', () => {
      expect(getBudgetStatusColor('healthy')).toBe('#10b981');
    });

    it('should return yellow for warning status', () => {
      expect(getBudgetStatusColor('warning')).toBe('#f59e0b');
    });

    it('should return red for critical status', () => {
      expect(getBudgetStatusColor('critical')).toBe('#ef4444');
    });

    it('should return dark red for over status', () => {
      expect(getBudgetStatusColor('over')).toBe('#991b1b');
    });
  });

  describe('getBudgetStatusEmoji', () => {
    it('should return correct emojis for each status', () => {
      expect(getBudgetStatusEmoji('healthy')).toBe('✅');
      expect(getBudgetStatusEmoji('warning')).toBe('⚠️');
      expect(getBudgetStatusEmoji('critical')).toBe('🔴');
      expect(getBudgetStatusEmoji('over')).toBe('🚨');
    });
  });

  describe('shouldAlertBudget', () => {
    it('should not alert when under 80%', () => {
      expect(shouldAlertBudget(75)).toBe(false);
    });

    it('should alert when at or above 80%', () => {
      expect(shouldAlertBudget(80)).toBe(true);
      expect(shouldAlertBudget(90)).toBe(true);
      expect(shouldAlertBudget(100)).toBe(true);
    });
  });

  describe('getBudgetAlertMessage', () => {
    it('should return null when under 80%', () => {
      expect(getBudgetAlertMessage('Food', 75)).toBeNull();
    });

    it('should return warning message at 80-89%', () => {
      const message = getBudgetAlertMessage('Food', 85);
      expect(message).toContain('⚠️');
      expect(message).toContain('Food');
      expect(message).toContain('85%');
    });

    it('should return critical message at 90-99%', () => {
      const message = getBudgetAlertMessage('Food', 95);
      expect(message).toContain('🔴');
      expect(message).toContain('Food');
      expect(message).toContain('95%');
    });

    it('should return exceeded message at 100%+', () => {
      const message = getBudgetAlertMessage('Food', 105);
      expect(message).toContain('🚨');
      expect(message).toContain('exceeded');
      expect(message).toContain('Food');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(formatCurrency(-500.00)).toBe('-$500.00');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('getCurrentMonth', () => {
    it('should return month in YYYY-MM format', () => {
      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year as number', () => {
      const year = getCurrentYear();
      expect(typeof year).toBe('number');
      expect(year).toBeGreaterThan(2020);
    });
  });

  describe('formatMonthDisplay', () => {
    it('should format month string to readable format', () => {
      const formatted = formatMonthDisplay('2025-10');
      expect(formatted).toContain('October');
      expect(formatted).toContain('2025');
    });

    it('should format January correctly', () => {
      const formatted = formatMonthDisplay('2025-01');
      expect(formatted).toContain('January');
    });

    it('should format December correctly', () => {
      const formatted = formatMonthDisplay('2025-12');
      expect(formatted).toContain('December');
    });
  });
});
