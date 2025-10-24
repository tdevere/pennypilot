import { databaseService } from '../database';
import { Budget } from '../../types';

describe('Budget Database Operations', () => {
  beforeAll(async () => {
    await databaseService.init();
  });

  describe('Budget CRUD', () => {
    it('should add a budget', async () => {
      const budget = {
        category: 'Food',
        amount: 500,
        month: '2025-10',
        year: 2025,
      };

      const id = await databaseService.addBudget(budget);
      expect(id).toBeGreaterThan(0);
    });

    it('should get budgets by month', async () => {
      await databaseService.addBudget({
        category: 'Transportation',
        amount: 200,
        month: '2025-10',
        year: 2025,
      });

      const budgets = await databaseService.getBudgetsByMonth('2025-10', 2025);
      expect(budgets.length).toBeGreaterThan(0);
      expect(budgets[0]).toHaveProperty('category');
      expect(budgets[0]).toHaveProperty('amount');
    });

    it('should get budget by category', async () => {
      const budget = await databaseService.getBudgetByCategory('Food', '2025-10', 2025);
      expect(budget).not.toBeNull();
      expect(budget?.category).toBe('Food');
      expect(budget?.amount).toBe(500);
    });

    it('should update a budget', async () => {
      const budget = await databaseService.getBudgetByCategory('Food', '2025-10', 2025);
      expect(budget).not.toBeNull();

      if (budget) {
        await databaseService.updateBudget(budget.id, 600);
        const updated = await databaseService.getBudgetByCategory('Food', '2025-10', 2025);
        expect(updated?.amount).toBe(600);
      }
    });

    it('should handle duplicate budgets with ON CONFLICT', async () => {
      // Add same budget twice - should update instead of error
      const budget = {
        category: 'Entertainment',
        amount: 100,
        month: '2025-10',
        year: 2025,
      };

      await databaseService.addBudget(budget);
      await databaseService.addBudget({ ...budget, amount: 150 });

      const result = await databaseService.getBudgetByCategory('Entertainment', '2025-10', 2025);
      expect(result?.amount).toBe(150);
    });

    it('should delete a budget', async () => {
      const budget = {
        category: 'ToDelete',
        amount: 50,
        month: '2025-10',
        year: 2025,
      };

      const id = await databaseService.addBudget(budget);
      await databaseService.deleteBudget(id);

      const deleted = await databaseService.getBudgetByCategory('ToDelete', '2025-10', 2025);
      expect(deleted).toBeNull();
    });

    it('should get all budgets', async () => {
      const budgets = await databaseService.getAllBudgets();
      expect(Array.isArray(budgets)).toBe(true);
      expect(budgets.length).toBeGreaterThan(0);
    });
  });

  describe('Budget vs Actual Calculations', () => {
    beforeEach(async () => {
      // Set up test budget
      await databaseService.addBudget({
        category: 'Groceries',
        amount: 400,
        month: '2025-10',
        year: 2025,
      });

      // Add test transactions
      const now = new Date().toISOString();
      await databaseService.addTransaction({
        amount: 150,
        category: 'Groceries',
        type: 'EXPENSE',
        description: 'Walmart',
        date: '2025-10-15',
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });

      await databaseService.addTransaction({
        amount: 100,
        category: 'Groceries',
        type: 'EXPENSE',
        description: 'Target',
        date: '2025-10-20',
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should calculate budget vs actual', async () => {
      const progress = await databaseService.getBudgetVsActual('Groceries', '2025-10', 2025);

      expect(progress).not.toBeNull();
      expect(progress?.category).toBe('Groceries');
      expect(progress?.budget).toBe(400);
      expect(progress?.spent).toBe(250);
      expect(progress?.percentage).toBe(62.5);
      expect(progress?.status).toBe('healthy');
      expect(progress?.remaining).toBe(150);
    });

    it('should return null for non-existent budget', async () => {
      const progress = await databaseService.getBudgetVsActual('NonExistent', '2025-10', 2025);
      expect(progress).toBeNull();
    });

    it('should exclude transactions marked as excludeFromReports', async () => {
      const now = new Date().toISOString();
      await databaseService.addTransaction({
        amount: 1000,
        category: 'Groceries',
        type: 'EXPENSE',
        description: 'Should be excluded',
        date: '2025-10-22',
        excludeFromReports: true,
        createdAt: now,
        updatedAt: now,
      });

      const progress = await databaseService.getBudgetVsActual('Groceries', '2025-10', 2025);
      expect(progress?.spent).toBe(250); // Should still be 250, not 1250
    });

    it('should only count EXPENSE transactions', async () => {
      const now = new Date().toISOString();
      await databaseService.addTransaction({
        amount: 500,
        category: 'Groceries',
        type: 'INCOME',
        description: 'Refund',
        date: '2025-10-25',
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });

      const progress = await databaseService.getBudgetVsActual('Groceries', '2025-10', 2025);
      expect(progress?.spent).toBe(250); // Should not include income
    });
  });

  describe('Budget Progress Summary', () => {
    beforeEach(async () => {
      // Set up multiple budgets
      await databaseService.addBudget({
        category: 'Housing',
        amount: 1200,
        month: '2025-11',
        year: 2025,
      });

      await databaseService.addBudget({
        category: 'Utilities',
        amount: 200,
        month: '2025-11',
        year: 2025,
      });

      // Add transactions
      const now = new Date().toISOString();
      await databaseService.addTransaction({
        amount: 1200,
        category: 'Housing',
        type: 'EXPENSE',
        description: 'Rent',
        date: '2025-11-01',
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });

      await databaseService.addTransaction({
        amount: 50,
        category: 'Utilities',
        type: 'EXPENSE',
        description: 'Electric',
        date: '2025-11-05',
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should get all budget progress for a month', async () => {
      const progressList = await databaseService.getAllBudgetProgress('2025-11', 2025);

      expect(progressList.length).toBe(2);
      expect(progressList.find(p => p.category === 'Housing')?.spent).toBe(1200);
      expect(progressList.find(p => p.category === 'Utilities')?.spent).toBe(50);
    });

    it('should calculate total budget summary', async () => {
      const summary = await databaseService.getTotalBudgetSummary('2025-11', 2025);

      expect(summary.totalBudget).toBe(1400); // 1200 + 200
      expect(summary.totalSpent).toBe(1250); // 1200 + 50
      expect(summary.percentage).toBeCloseTo(89.29, 1);
      expect(summary.remaining).toBe(150);
    });
  });
});
