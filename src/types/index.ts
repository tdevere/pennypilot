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
  Settings: undefined;
};
