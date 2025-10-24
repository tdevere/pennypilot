# 🧪 Testing Guide for PennyPilot

## 📋 Overview

This project uses **Jest** as the testing framework with **React Native Testing Library** for component testing.

## 🚀 Quick Start

```bash
# Install dependencies (includes testing packages)
npm install

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI mode (for GitHub Actions)
npm run test:ci
```

## 📁 Test File Structure

```
src/
├── services/
│   ├── database.ts
│   ├── openai.ts
│   └── __tests__/
│       ├── database.test.ts
│       └── openai.test.ts
├── screens/
│   ├── TransactionsScreen.tsx
│   └── __tests__/
│       └── TransactionsScreen.test.tsx
└── utils/
    ├── formatters.ts
    └── __tests__/
        └── formatters.test.ts
```

## ✅ Coverage Requirements

- **Lines:** 70%+
- **Statements:** 70%+
- **Functions:** 70%+
- **Branches:** 70%+

## 🎯 What to Test

### ✅ **Always Test**
- Database CRUD operations
- API integrations (OpenAI service)
- Business logic (calculations, validations)
- Utility functions (formatters, converters)
- Critical user flows

### ❌ **Don't Test**
- Third-party libraries (expo-sqlite, axios, etc.)
- React Navigation internals
- Expo SDK modules
- Simple getters/setters

## 📝 Writing Tests

### **Unit Test Example (Services)**

```typescript
// src/services/__tests__/database.test.ts
import { databaseService } from '../database';

describe('DatabaseService', () => {
  beforeAll(async () => {
    await databaseService.init();
  });

  it('should add a transaction', async () => {
    const transaction = {
      amount: 50.99,
      category: 'Food',
      type: 'EXPENSE' as const,
      description: 'Grocery shopping',
      date: '2025-10-23',
    };

    const id = await databaseService.addTransaction(transaction);
    expect(id).toBeGreaterThan(0);
  });
});
```

### **Component Test Example**

```typescript
// src/screens/__tests__/TransactionsScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransactionsScreen from '../TransactionsScreen';

jest.mock('../../services/database');

describe('TransactionsScreen', () => {
  const mockNavigation: any = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
  };

  it('renders transaction list', async () => {
    const { getByText } = render(
      <TransactionsScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Grocery shopping')).toBeTruthy();
    });
  });
});
```

### **Utility Test Example**

```typescript
// src/utils/__tests__/formatters.test.ts
import { formatCurrency, formatDate } from '../formatters';

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(50.99)).toBe('$50.99');
  });

  it('formats negative amounts correctly', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});
```

## 🔧 Test Configuration

### **jest.config.js**
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### **jest.setup.js**
Mocks for Expo modules, React Navigation, and AsyncStorage.

## 🤖 CI/CD Integration

Tests run automatically on:
- ✅ Every push to `feature/*` branches
- ✅ Every pull request to `develop` or `main`
- ✅ Every merge to `develop` or `main`

### **GitHub Actions Workflow**

```yaml
- name: Run tests with coverage
  run: npm run test:ci

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3

- name: Comment PR with coverage
  # Auto-comments coverage report on PR
```

## 📊 Viewing Coverage

### **Local Development**

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
start coverage/lcov-report/index.html  # Windows
open coverage/lcov-report/index.html   # Mac
```

### **GitHub Actions**

Coverage reports are automatically:
- ✅ Generated on every test run
- ✅ Uploaded to Codecov
- ✅ Commented on Pull Requests

## 🎯 Testing Best Practices

### **1. Test File Naming**
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- Place tests in `__tests__` directory next to source files

### **2. Test Structure**
```typescript
describe('ComponentOrService', () => {
  // Setup
  beforeAll(() => { /* runs once before all tests */ });
  beforeEach(() => { /* runs before each test */ });
  afterEach(() => { /* runs after each test */ });
  afterAll(() => { /* runs once after all tests */ });

  describe('feature or method', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = doSomething(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### **3. Use Descriptive Test Names**

✅ **Good:**
```typescript
it('should calculate 25% progress when currentAmount is 2500 and targetAmount is 10000')
it('should throw error when API key is invalid')
it('should filter transactions by date range excluding weekends')
```

❌ **Bad:**
```typescript
it('works')
it('test 1')
it('should work correctly')
```

### **4. Test Edge Cases**

```typescript
describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles very large numbers', () => {
    expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });
});
```

### **5. Mock External Dependencies**

```typescript
// Mock database
jest.mock('../../services/database', () => ({
  databaseService: {
    getAllTransactions: jest.fn(() => Promise.resolve([])),
    addTransaction: jest.fn(() => Promise.resolve(1)),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock AsyncStorage (already done in jest.setup.js)
```

### **6. Clean Up After Tests**

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Close database connections
  // Clear test data
});
```

## 🐛 Debugging Tests

### **Run Single Test File**
```bash
npm test database.test.ts
```

### **Run Single Test**
```bash
npm test -t "should add a transaction"
```

### **Debug with VS Code**
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### **Watch Specific Files**
```bash
npm run test:watch database
```

## 📈 Improving Coverage

### **Find Uncovered Code**
```bash
npm run test:coverage

# Look for red/yellow lines in coverage report
start coverage/lcov-report/index.html
```

### **Target Low Coverage Areas**
1. Check coverage report
2. Find files with <70% coverage
3. Add tests for uncovered branches/functions
4. Re-run coverage

## ✅ Pre-Commit Checklist

Before committing code:

```bash
# 1. Run type check
npm run type-check

# 2. Run linter
npm run lint

# 3. Format code
npm run format

# 4. Run tests
npm test

# 5. Check coverage
npm run test:coverage
```

## 🚀 CI/CD Test Flow

```
Push Code
    ↓
GitHub Actions Triggered
    ↓
Install Dependencies
    ↓
Type Check (TypeScript)
    ↓
Lint Check (ESLint)
    ↓
Format Check (Prettier)
    ↓
Run Tests with Coverage
    ↓
Upload to Codecov
    ↓
Comment on PR with Results
    ↓
✅ Pass → Allow Merge
❌ Fail → Block Merge
```

## 📞 Getting Help

- **Jest Docs:** https://jestjs.io/docs/getting-started
- **React Native Testing Library:** https://callstack.github.io/react-native-testing-library/
- **Testing best practices:** See `CONTRIBUTING.md`
- **Ask in GitHub Discussions:** https://github.com/tdevere/pennypilot/discussions

## 🎯 Testing Roadmap

### **Current State (v0.6.0)**
- [x] Jest configuration
- [x] Mock setup for Expo modules
- [x] Sample database tests
- [x] CI/CD integration
- [ ] Component tests (0%)
- [ ] Service tests (30%)
- [ ] Integration tests (0%)

### **MVP Target (v1.0.0)**
- [ ] 70%+ code coverage
- [ ] All critical paths tested
- [ ] Component tests for all screens
- [ ] Integration tests for key flows
- [ ] E2E tests for core features

---

**Remember:** Good tests = confident deployments = happy users! 🎉
