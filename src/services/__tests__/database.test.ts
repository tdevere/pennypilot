import { databaseService } from '../database';
import { Transaction, Goal, LineItem } from '../../types';

describe('DatabaseService', () => {
  beforeAll(async () => {
    await databaseService.init();
  });

  describe('Transactions', () => {
    it('should add a transaction', async () => {
      const transaction: Omit<Transaction, 'id'> = {
        amount: 50.99,
        category: 'Food',
        type: 'expense',
        description: 'Grocery shopping',
        date: '2025-10-23',
        merchant: 'Walmart',
      };

      const id = await databaseService.addTransaction(transaction);
      expect(id).toBeGreaterThan(0);
    });

    it('should get all transactions', async () => {
      const transactions = await databaseService.getAllTransactions();
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should update a transaction', async () => {
      const transaction: Omit<Transaction, 'id'> = {
        amount: 75.50,
        category: 'Transportation',
        type: 'expense',
        description: 'Gas',
        date: '2025-10-23',
      };

      const id = await databaseService.addTransaction(transaction);
      
      await databaseService.updateTransaction(id, {
        ...transaction,
        amount: 80.00,
      });

      const updated = await databaseService.getTransactionById(id);
      expect(updated?.amount).toBe(80.00);
    });

    it('should delete a transaction', async () => {
      const transaction: Omit<Transaction, 'id'> = {
        amount: 25.00,
        category: 'Entertainment',
        type: 'expense',
        description: 'Movie tickets',
        date: '2025-10-23',
      };

      const id = await databaseService.addTransaction(transaction);
      await databaseService.deleteTransaction(id);
      
      const deleted = await databaseService.getTransactionById(id);
      expect(deleted).toBeNull();
    });

    it('should filter transactions by date range', async () => {
      // Add some test transactions
      await databaseService.addTransaction({
        amount: 100,
        category: 'Food',
        type: 'expense',
        description: 'Test 1',
        date: '2025-10-15',
      });

      await databaseService.addTransaction({
        amount: 200,
        category: 'Food',
        type: 'expense',
        description: 'Test 2',
        date: '2025-10-25',
      });

      const startDate = '2025-10-01';
      const endDate = '2025-10-20';
      const transactions = await databaseService.getTransactionsByDateRange(startDate, endDate);
      
      transactions.forEach(transaction => {
        expect(transaction.date >= startDate).toBe(true);
        expect(transaction.date <= endDate).toBe(true);
      });
    });
  });

  describe('Line Items', () => {
    let transactionId: number;

    beforeEach(async () => {
      transactionId = await databaseService.addTransaction({
        amount: 100,
        category: 'Food',
        type: 'expense',
        description: 'Test transaction',
        date: '2025-10-23',
      });
    });

    it('should add a line item', async () => {
      const lineItem = {
        transactionId,
        name: 'Apple',
        quantity: 5,
        unitPrice: 1.99,
        totalPrice: 9.95,
      };

      const id = await databaseService.addLineItem(lineItem);
      expect(id).toBeGreaterThan(0);
    });

    it('should get line items by transaction', async () => {
      await databaseService.addLineItem({
        transactionId,
        name: 'Banana',
        quantity: 3,
        unitPrice: 0.50,
        totalPrice: 1.50,
      });

      const lineItems = await databaseService.getLineItemsByTransaction(transactionId);
      expect(lineItems.length).toBeGreaterThan(0);
      expect(lineItems[0].transactionId).toBe(transactionId);
    });

    it('should update a line item', async () => {
      const id = await databaseService.addLineItem({
        transactionId,
        name: 'Orange',
        quantity: 2,
        unitPrice: 2.00,
        totalPrice: 4.00,
      });

      await databaseService.updateLineItem(id, {
        transactionId,
        name: 'Orange',
        quantity: 5,
        unitPrice: 2.00,
        totalPrice: 10.00,
      });

      const lineItems = await databaseService.getLineItemsByTransaction(transactionId);
      const updated = lineItems.find(item => item.id === id);
      expect(updated?.quantity).toBe(5);
      expect(updated?.totalPrice).toBe(10.00);
    });

    it('should delete a line item', async () => {
      const id = await databaseService.addLineItem({
        transactionId,
        name: 'Grape',
        quantity: 1,
        unitPrice: 5.00,
        totalPrice: 5.00,
      });

      await databaseService.deleteLineItem(id);
      
      const lineItems = await databaseService.getLineItemsByTransaction(transactionId);
      const deleted = lineItems.find(item => item.id === id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('Goals', () => {
    it('should add a goal', async () => {
      const goal = {
        name: 'Vacation Fund',
        targetAmount: 5000,
        currentAmount: 0,
        deadline: '2025-12-31',
      };

      const id = await databaseService.addGoal(goal);
      expect(id).toBeGreaterThan(0);
    });

    it('should get all goals', async () => {
      const goals = await databaseService.getAllGoals();
      expect(Array.isArray(goals)).toBe(true);
    });

    it('should update goal progress', async () => {
      const goal = {
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: '2026-12-31',
      };

      const id = await databaseService.addGoal(goal);

      await databaseService.updateGoal(id, {
        ...goal,
        currentAmount: 1000,
      });

      const updated = await databaseService.getGoalById(id);
      expect(updated?.currentAmount).toBe(1000);
    });

    it('should delete a goal', async () => {
      const goal = {
        name: 'Test Goal',
        targetAmount: 1000,
        currentAmount: 0,
        deadline: '2026-01-01',
      };

      const id = await databaseService.addGoal(goal);
      await databaseService.deleteGoal(id);

      const deleted = await databaseService.getGoalById(id);
      expect(deleted).toBeNull();
    });

    it('should calculate goal progress percentage', async () => {
      const goal = {
        name: 'Car Fund',
        targetAmount: 20000,
        currentAmount: 5000,
        deadline: '2026-06-30',
      };

      const id = await databaseService.addGoal(goal);
      const retrieved = await databaseService.getGoalById(id);

      expect(retrieved).not.toBeNull();
      if (retrieved) {
        const percentage = (retrieved.currentAmount / retrieved.targetAmount) * 100;
        expect(percentage).toBe(25);
      }
    });
  });
});
