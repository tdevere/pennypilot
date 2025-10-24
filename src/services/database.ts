import * as SQLite from 'expo-sqlite';
import { Transaction, LineItem } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync('pennypilot.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        merchant TEXT,
        excludeFromReports INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        FOREIGN KEY (transactionId) REFERENCES transactions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        currentAmount REAL DEFAULT 0,
        deadline TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    // Add merchant column to existing transactions table if it doesn't exist
    try {
      await this.db.execAsync(`
        ALTER TABLE transactions ADD COLUMN merchant TEXT;
      `);
      console.log('Added merchant column to transactions table');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('Merchant column may already exist');
    }
  }

  // Transaction CRUD operations
  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    
    // Map the results and handle the excludeFromReports boolean conversion
    return result.map(row => ({
      ...row,
      excludeFromReports: row.excludeFromReports === 1,
      merchant: row.merchant || undefined,
    }));
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO transactions (amount, description, category, date, type, merchant, excludeFromReports, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      transaction.amount,
      transaction.description,
      transaction.category,
      transaction.date,
      transaction.type,
      transaction.merchant || null,
      transaction.excludeFromReports ? 1 : 0,
      transaction.createdAt,
      transaction.updatedAt
    );

    return result.lastInsertRowId;
  }

  async updateTransaction(id: number, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = [];
    const values: any[] = [];

    if (transaction.amount !== undefined) {
      updates.push('amount = ?');
      values.push(transaction.amount);
    }
    if (transaction.description !== undefined) {
      updates.push('description = ?');
      values.push(transaction.description);
    }
    if (transaction.category !== undefined) {
      updates.push('category = ?');
      values.push(transaction.category);
    }
    if (transaction.date !== undefined) {
      updates.push('date = ?');
      values.push(transaction.date);
    }
    if (transaction.type !== undefined) {
      updates.push('type = ?');
      values.push(transaction.type);
    }
    if (transaction.merchant !== undefined) {
      updates.push('merchant = ?');
      values.push(transaction.merchant || null);
    }
    if (transaction.excludeFromReports !== undefined) {
      updates.push('excludeFromReports = ?');
      values.push(transaction.excludeFromReports ? 1 : 0);
    }

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.runAsync(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async deleteTransaction(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM transactions WHERE id = ?', id);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      startDate,
      endDate
    );
    
    return result.map(row => ({
      ...row,
      excludeFromReports: row.excludeFromReports === 1,
      merchant: row.merchant || undefined,
    }));
  }

  // Goal CRUD operations
  async getAllGoals() {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM goals ORDER BY deadline ASC'
    );
    return result;
  }

  async addGoal(goal: { name: string; targetAmount: number; currentAmount: number; deadline: string }) {
    if (!this.db) throw new Error('Database not initialized');

    const createdAt = new Date().toISOString();
    const result = await this.db.runAsync(
      `INSERT INTO goals (name, targetAmount, currentAmount, deadline, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      goal.name,
      goal.targetAmount,
      goal.currentAmount,
      goal.deadline,
      createdAt
    );

    return result.lastInsertRowId;
  }

  async updateGoalProgress(id: number, currentAmount: number) {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'UPDATE goals SET currentAmount = ? WHERE id = ?',
      currentAmount,
      id
    );
  }

  async updateGoal(id: number, goal: { name?: string; targetAmount?: number; currentAmount?: number; deadline?: string }) {
    if (!this.db) throw new Error('Database not initialized');
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (goal.name !== undefined) {
      updates.push('name = ?');
      values.push(goal.name);
    }
    if (goal.targetAmount !== undefined) {
      updates.push('targetAmount = ?');
      values.push(goal.targetAmount);
    }
    if (goal.currentAmount !== undefined) {
      updates.push('currentAmount = ?');
      values.push(goal.currentAmount);
    }
    if (goal.deadline !== undefined) {
      updates.push('deadline = ?');
      values.push(goal.deadline);
    }
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async getGoalById(id: number) {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT * FROM goals WHERE id = ?',
      id
    );
    return result || null;
  }

  async deleteGoal(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM goals WHERE id = ?', id);
  }

  // Line Item CRUD operations
  async addLineItem(lineItem: Omit<LineItem, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      'INSERT INTO line_items (transactionId, name, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)',
      lineItem.transactionId,
      lineItem.name,
      lineItem.quantity,
      lineItem.unitPrice,
      lineItem.totalPrice
    );
    
    return result.lastInsertRowId;
  }

  async updateLineItem(id: number, lineItem: Omit<LineItem, 'id'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'UPDATE line_items SET name = ?, quantity = ?, unitPrice = ?, totalPrice = ? WHERE id = ?',
      lineItem.name,
      lineItem.quantity,
      lineItem.unitPrice,
      lineItem.totalPrice,
      id
    );
  }

  async deleteLineItem(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM line_items WHERE id = ?', id);
  }

  async getLineItemsByTransaction(transactionId: number): Promise<LineItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllAsync<LineItem>(
      'SELECT * FROM line_items WHERE transactionId = ? ORDER BY id',
      transactionId
    );
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM transactions WHERE id = ?',
      id
    );
    
    if (!row) return null;
    
    return {
      ...row,
      excludeFromReports: row.excludeFromReports === 1,
      merchant: row.merchant || undefined,
    };
  }
}

export const databaseService = new DatabaseService();
