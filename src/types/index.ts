export interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string
  type: 'INCOME' | 'EXPENSE';
  excludeFromReports: boolean;
  merchant?: string;
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

export interface Budget {
  id: number;
  category: string;
  amount: number;
  month: string; // Format: 'YYYY-MM'
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical' | 'over';
  remaining: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  ScanReceipt: undefined;
  AddGoal: undefined;
  LineItems: { transactionId: number };
};

export type MainTabsParamList = {
  Transactions: undefined;
  Goals: undefined;
  Reports: undefined;
  Budget: undefined;
  Settings: undefined;
};
