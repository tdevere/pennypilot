import { RecurringTransaction, RecurringFrequency } from '../types';
import { databaseService } from './database';

class RecurringTransactionService {
  /**
   * Calculate the next occurrence date based on frequency and interval
   */
  calculateNextDate(currentDate: string, frequency: RecurringFrequency, intervalCount: number): string {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'DAILY':
        date.setDate(date.getDate() + intervalCount);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + (7 * intervalCount));
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + intervalCount);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + intervalCount);
        break;
    }
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }

  /**
   * Generate a transaction from a recurring transaction template
   */
  async generateTransactionFromRecurring(recurring: RecurringTransaction): Promise<number> {
    const now = new Date().toISOString();
    
    // Create the transaction
    const transactionId = await databaseService.addTransaction({
      amount: recurring.amount,
      description: recurring.description,
      category: recurring.category,
      type: recurring.type,
      merchant: recurring.merchant,
      date: recurring.nextDate,
      excludeFromReports: false,
      recurringTransactionId: recurring.id,
      createdAt: now,
      updatedAt: now,
    });

    // Update the recurring transaction with new nextDate and lastGeneratedDate
    const nextDate = this.calculateNextDate(
      recurring.nextDate,
      recurring.frequency,
      recurring.intervalCount
    );

    // Check if we've passed the end date
    let isActive = recurring.isActive;
    if (recurring.endDate && nextDate > recurring.endDate) {
      isActive = false; // Auto-disable if past end date
    }

    await databaseService.updateRecurringTransaction(recurring.id, {
      nextDate,
      lastGeneratedDate: recurring.nextDate,
      isActive,
      updatedAt: now,
    });

    return transactionId;
  }

  /**
   * Process all due recurring transactions
   */
  async processRecurringTransactions(): Promise<number> {
    try {
      const dueRecurring = await databaseService.getDueRecurringTransactions();
      let generatedCount = 0;

      for (const recurring of dueRecurring) {
        try {
          await this.generateTransactionFromRecurring(recurring);
          generatedCount++;
          console.log(`Generated transaction for: ${recurring.description}`);
        } catch (error) {
          console.error(`Error generating transaction for recurring ID ${recurring.id}:`, error);
        }
      }

      if (generatedCount > 0) {
        console.log(`Successfully generated ${generatedCount} recurring transaction(s)`);
      }

      return generatedCount;
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      return 0;
    }
  }

  /**
   * Check and generate transactions on app startup or focus
   */
  async checkAndGenerateTransactions(): Promise<void> {
    console.log('Checking for due recurring transactions...');
    const count = await this.processRecurringTransactions();
    
    if (count > 0) {
      console.log(`Generated ${count} recurring transactions`);
    }
  }

  /**
   * Get a human-readable description of the frequency
   */
  getFrequencyDescription(frequency: RecurringFrequency, intervalCount: number): string {
    const interval = intervalCount > 1 ? `${intervalCount} ` : '';
    
    switch (frequency) {
      case 'DAILY':
        return intervalCount === 1 ? 'Daily' : `Every ${interval}days`;
      case 'WEEKLY':
        return intervalCount === 1 ? 'Weekly' : `Every ${interval}weeks`;
      case 'MONTHLY':
        return intervalCount === 1 ? 'Monthly' : `Every ${interval}months`;
      case 'YEARLY':
        return intervalCount === 1 ? 'Yearly' : `Every ${interval}years`;
    }
  }

  /**
   * Get the next N occurrences for preview
   */
  getNextOccurrences(startDate: string, frequency: RecurringFrequency, intervalCount: number, count: number = 5): string[] {
    const dates: string[] = [];
    let currentDate = startDate;
    
    for (let i = 0; i < count; i++) {
      dates.push(currentDate);
      currentDate = this.calculateNextDate(currentDate, frequency, intervalCount);
    }
    
    return dates;
  }
}

export const recurringTransactionService = new RecurringTransactionService();
