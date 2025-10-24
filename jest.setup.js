// Mock Expo winter runtime to prevent import errors
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

// Mock global Expo registry and structuredClone
global.__ExpoImportMetaRegistry = {};
global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules with in-memory storage
const mockDatabase = {
  transactions: new Map(),
  lineItems: new Map(),
  goals: new Map(),
  budgets: new Map(),
  nextId: {
    transactions: 1,
    lineItems: 1,
    goals: 1,
    budgets: 1,
  },
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(() => Promise.resolve()),
      runAsync: jest.fn((sql, ...params) => {
        let lastInsertRowId = 0;
        let changes = 0;
        
        if (sql.includes('INSERT INTO transactions')) {
          lastInsertRowId = mockDatabase.nextId.transactions++;
          mockDatabase.transactions.set(lastInsertRowId, {
            id: lastInsertRowId,
            amount: params[0],
            description: params[1],
            category: params[2],
            date: params[3],
            type: params[4],
            merchant: params[5],
            excludeFromReports: params[6] || 0,
            createdAt: params[7],
            updatedAt: params[8],
          });
          changes = 1;
        } else if (sql.includes('INSERT INTO line_items')) {
          lastInsertRowId = mockDatabase.nextId.lineItems++;
          mockDatabase.lineItems.set(lastInsertRowId, {
            id: lastInsertRowId,
            transactionId: params[0],
            name: params[1],
            quantity: params[2],
            unitPrice: params[3],
            totalPrice: params[4],
          });
          changes = 1;
        } else if (sql.includes('INSERT INTO goals')) {
          lastInsertRowId = mockDatabase.nextId.goals++;
          mockDatabase.goals.set(lastInsertRowId, {
            id: lastInsertRowId,
            name: params[0],
            targetAmount: params[1],
            currentAmount: params[2],
            deadline: params[3],
            createdAt: params[4],
          });
          changes = 1;
        } else if (sql.includes('INSERT INTO budgets')) {
          // Handle ON CONFLICT - check if budget exists for category/month/year
          const category = params[0];
          const month = params[2];
          const year = params[3];
          const existingBudget = Array.from(mockDatabase.budgets.values()).find(
            b => b.category === category && b.month === month && b.year === year
          );
          
          if (existingBudget) {
            // Update existing
            existingBudget.amount = params[1];
            existingBudget.updatedAt = params[5];
            lastInsertRowId = existingBudget.id;
          } else {
            // Insert new
            lastInsertRowId = mockDatabase.nextId.budgets++;
            mockDatabase.budgets.set(lastInsertRowId, {
              id: lastInsertRowId,
              category: params[0],
              amount: params[1],
              month: params[2],
              year: params[3],
              createdAt: params[4],
              updatedAt: params[5],
            });
          }
          changes = 1;
        } else if (sql.includes('UPDATE transactions')) {
          const id = params[params.length - 1];
          const existing = mockDatabase.transactions.get(id);
          if (existing) {
            mockDatabase.transactions.set(id, { ...existing, ...Object.fromEntries(params.slice(0, -1).map((v, i) => [Object.keys(existing)[i + 1], v])) });
            changes = 1;
          }
        } else if (sql.includes('UPDATE line_items')) {
          const id = params[params.length - 1];
          const existing = mockDatabase.lineItems.get(id);
          if (existing) {
            // UPDATE line_items SET name = ?, quantity = ?, unitPrice = ?, totalPrice = ? WHERE id = ?
            existing.name = params[0];
            existing.quantity = params[1];
            existing.unitPrice = params[2];
            existing.totalPrice = params[3];
            changes = 1;
          }
        } else if (sql.includes('UPDATE goals') && sql.includes('currentAmount') && !sql.includes(',')) {
          // UPDATE goals SET currentAmount = ? WHERE id = ?
          const id = params[params.length - 1];
          const existing = mockDatabase.goals.get(id);
          if (existing) {
            existing.currentAmount = params[0];
            changes = 1;
          }
        } else if (sql.includes('UPDATE goals')) {
          // UPDATE goals SET name = ?, targetAmount = ?, ... WHERE id = ?
          const id = params[params.length - 1];
          const existing = mockDatabase.goals.get(id);
          if (existing) {
            // Parse the SQL to map params to fields
            const fields = sql.match(/SET (.*?) WHERE/)[1].split(',').map(f => f.trim().split('=')[0].trim());
            fields.forEach((field, index) => {
              existing[field] = params[index];
            });
            changes = 1;
          }
        } else if (sql.includes('DELETE FROM transactions')) {
          const id = params[0];
          if (mockDatabase.transactions.delete(id)) changes = 1;
        } else if (sql.includes('DELETE FROM line_items')) {
          const id = params[0];
          if (mockDatabase.lineItems.delete(id)) changes = 1;
        } else if (sql.includes('DELETE FROM goals')) {
          const id = params[0];
          if (mockDatabase.goals.delete(id)) changes = 1;
        } else if (sql.includes('UPDATE budgets')) {
          // UPDATE budgets SET amount = ?, updatedAt = ? WHERE id = ?
          const id = params[params.length - 1];
          const existing = mockDatabase.budgets.get(id);
          if (existing) {
            existing.amount = params[0];
            existing.updatedAt = params[1];
            changes = 1;
          }
        } else if (sql.includes('DELETE FROM budgets')) {
          const id = params[0];
          if (mockDatabase.budgets.delete(id)) changes = 1;
        }
        
        return Promise.resolve({ lastInsertRowId, changes });
      }),
      getAllAsync: jest.fn((sql, ...params) => {
        if (sql.includes('FROM transactions')) {
          let transactions = Array.from(mockDatabase.transactions.values());
          // Handle date range filtering: WHERE date BETWEEN ? AND ?
          if (sql.includes('BETWEEN') && params.length >= 2) {
            const startDate = params[0];
            const endDate = params[1];
            transactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);
          }
          return Promise.resolve(transactions);
        } else if (sql.includes('FROM line_items')) {
          if (params.length > 0) {
            // Filter by transactionId
            return Promise.resolve(
              Array.from(mockDatabase.lineItems.values()).filter(item => item.transactionId === params[0])
            );
          }
          return Promise.resolve(Array.from(mockDatabase.lineItems.values()));
        } else if (sql.includes('FROM goals')) {
          return Promise.resolve(Array.from(mockDatabase.goals.values()));
        } else if (sql.includes('FROM budgets')) {
          let budgets = Array.from(mockDatabase.budgets.values());
          // Filter by month and year if specified
          if (sql.includes('WHERE month = ?') && params.length >= 2) {
            const month = params[0];
            const year = params[1];
            budgets = budgets.filter(b => b.month === month && b.year === year);
          }
          return Promise.resolve(budgets);
        }
        return Promise.resolve([]);
      }),
      getFirstAsync: jest.fn((sql, ...params) => {
        if (sql.includes('FROM transactions') && params.length > 0) {
          // Handle WHERE clause for budget vs actual calculation
          if (sql.includes('SUM(amount)')) {
            // SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE...
            const category = params[0];
            const startDate = params[1];
            const endDate = params[2];
            const total = Array.from(mockDatabase.transactions.values())
              .filter(t => 
                t.category === category && 
                t.type === 'EXPENSE' &&
                t.date >= startDate && 
                t.date <= endDate &&
                t.excludeFromReports === 0
              )
              .reduce((sum, t) => sum + t.amount, 0);
            return Promise.resolve({ total });
          }
          return Promise.resolve(mockDatabase.transactions.get(params[0]) || null);
        } else if (sql.includes('FROM line_items') && params.length > 0) {
          return Promise.resolve(mockDatabase.lineItems.get(params[0]) || null);
        } else if (sql.includes('FROM goals') && params.length > 0) {
          return Promise.resolve(mockDatabase.goals.get(params[0]) || null);
        } else if (sql.includes('FROM budgets') && params.length > 0) {
          // Get budget by category, month, year
          if (params.length === 3) {
            const category = params[0];
            const month = params[1];
            const year = params[2];
            const budget = Array.from(mockDatabase.budgets.values()).find(
              b => b.category === category && b.month === month && b.year === year
            );
            return Promise.resolve(budget || null);
          }
          return Promise.resolve(mockDatabase.budgets.get(params[0]) || null);
        }
        return Promise.resolve(null);
      }),
    })
  ),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file://mock-directory/',
  readAsStringAsync: jest.fn(() => Promise.resolve('{}')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      type: 'success',
      assets: [{ uri: 'file://mock-file.json' }],
    })
  ),
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock-image.jpg', base64: 'mock-base64' }],
    })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock-image.jpg', base64: 'mock-base64' }],
    })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true, expires: 'never' })
  ),
  MediaType: { Images: 'Images' },
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

// Silence console during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
