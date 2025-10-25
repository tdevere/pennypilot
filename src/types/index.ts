export interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string
  type: 'INCOME' | 'EXPENSE';
  excludeFromReports: boolean;
  merchant?: string;
  recurringTransactionId?: number; // Link to recurring template if auto-generated
  createdAt: string;
  updatedAt: string;
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  merchant?: string;
  frequency: RecurringFrequency;
  intervalCount: number; // e.g., every 2 weeks = intervalCount: 2, frequency: WEEKLY
  nextDate: string; // ISO date string for next occurrence
  endDate?: string; // Optional end date
  isActive: boolean;
  lastGeneratedDate?: string; // Last time a transaction was auto-generated
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id?: number;
  transactionId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  ScanReceipt: undefined;
  AddGoal: undefined;
  LineItems: { transactionId: number };
  AddRecurringTransaction: undefined;
  EditRecurringTransaction: { recurringTransaction: RecurringTransaction };
};

export type MainTabsParamList = {
  Transactions: undefined;
  Goals: undefined;
  Recurring: undefined;
  Reports: undefined;
  Settings: undefined;
};
