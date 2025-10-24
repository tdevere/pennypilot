# Contributing to PennyPilot

First off, thank you for considering contributing to PennyPilot! 🎉

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/expo_expense_tracker.git
   cd expo_expense_tracker
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/expo_expense_tracker.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   # Copy example env file (if exists)
   cp .env.example .env
   
   # Add your OpenAI API key
   # OPENAI_API_KEY=your_key_here
   ```

6. **Run the app**
   ```bash
   npx expo start --clear
   ```

## 📋 Development Workflow

### Finding Work

1. Check the [ROADMAP.md](ROADMAP.md) for planned features
2. Browse [open issues](../../issues) with `good first issue` or `help wanted` labels
3. Look at the current milestone for priority items
4. Comment on an issue to claim it before starting work

### Creating a Branch

```bash
# Always create a new branch for your work
git checkout -b feature/issue-number-short-description

# Examples:
git checkout -b feature/1-budget-management
git checkout -b fix/23-transaction-delete-bug
git checkout -b docs/update-readme
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### Making Changes

1. **Keep commits focused**
   - One logical change per commit
   - Write clear commit messages

2. **Commit message format**
   ```
   type(scope): subject

   body (optional)

   footer (optional)
   ```

   **Examples:**
   ```
   feat(budget): add monthly budget setting per category
   
   Implements budget management feature with:
   - Category-specific budget limits
   - Budget vs actual comparison
   - Over-budget warnings
   
   Closes #1
   ```

   ```
   fix(reports): remove duplicate "No Data" message
   
   Fixed empty state logic to not show when categories selected
   
   Fixes #15
   ```

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Testing Your Changes

```bash
# Run TypeScript checks
npx tsc --noEmit

# Test on iOS
npx expo start --ios

# Test on Android
npx expo start --android

# Test on web
npx expo start --web
```

### Code Quality Checklist

Before submitting your PR, ensure:

- [ ] Code follows TypeScript best practices
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Database migrations are included if schema changed
- [ ] New screens are added to navigation
- [ ] Empty states are handled
- [ ] Loading states are implemented
- [ ] Error handling is in place
- [ ] Code is formatted consistently
- [ ] Comments explain complex logic
- [ ] No console.log statements left in code
- [ ] Tested on iOS (if possible)
- [ ] Tested on Android (if possible)

## 🔄 Submitting a Pull Request

### 1. Update Your Fork

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-branch-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template:

```markdown
## 📋 Description
Brief description of changes

## 🔗 Related Issue
Closes #[issue number]

## 📸 Screenshots
(if UI changes)

## ✅ Checklist
- [ ] Code follows project conventions
- [ ] TypeScript checks pass
- [ ] Tested on device/simulator
- [ ] Documentation updated
- [ ] Database migrations included (if needed)

## 🧪 Testing Steps
1. Step 1
2. Step 2
3. Expected result
```

### 4. Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Your contribution will be credited!

## 🎨 Code Style Guide

### TypeScript

```typescript
// ✅ Good: Clear types, descriptive names
interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string;
}

const addTransaction = async (transaction: Transaction): Promise<void> => {
  // Implementation
};

// ❌ Bad: Any types, unclear names
const addTxn = async (t: any) => {
  // Implementation
};
```

### React Components

```typescript
// ✅ Good: Functional components with proper typing
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  amount: number;
  onPress: () => void;
}

export const TransactionCard: React.FC<Props> = ({ title, amount, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      <Text>${amount.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
```

### Database Operations

```typescript
// ✅ Good: Error handling, proper types
export const getTransactionById = async (id: number): Promise<Transaction | null> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<DatabaseTransaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      excludeFromReports: result.excludeFromReports === 1,
      merchant: result.merchant || undefined,
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};

// ❌ Bad: No error handling, type conversions missing
export const getTransactionById = async (id: number) => {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT * FROM transactions WHERE id = ?', [id]);
};
```

### Styling

```typescript
// ✅ Good: Organized, reusable styles
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  
  // Typography
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  
  // Components
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
```

## 🔍 Project Structure

```
expo_expense_tracker/
├── src/
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   ├── services/            # Business logic (database, API)
│   ├── types/               # TypeScript types
│   └── components/          # Reusable components (future)
├── assets/                  # Images, fonts, etc.
├── .github/                 # GitHub templates and workflows
├── ROADMAP.md              # Product roadmap
├── CONTRIBUTING.md         # This file
└── README.md               # Project overview
```

## 🐛 Reporting Bugs

1. Check if the bug is already reported in [issues](../../issues)
2. Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Device/OS information
   - Screenshots/videos if applicable

## 💡 Suggesting Features

1. Check [ROADMAP.md](ROADMAP.md) to see if it's already planned
2. Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Explain:
   - Problem you're trying to solve
   - Proposed solution
   - Why it benefits users
   - Whether it should be free or premium

## 📚 Documentation

Documentation improvements are always welcome!

- Fix typos or unclear explanations
- Add examples or tutorials
- Improve code comments
- Update outdated information

## 🎯 Priority Labels

Issues are labeled by priority:
- `priority: critical` - App-breaking bugs, security issues
- `priority: high` - Important features, major bugs
- `priority: medium` - Nice-to-have features
- `priority: low` - Future enhancements

Focus on higher priority items for greater impact!

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment.

### Expected Behavior
- Be respectful and considerate
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Spam or off-topic discussions
- Sharing private information

### Enforcement
Report unacceptable behavior to [conduct@pennypilot.app]
Violations may result in temporary or permanent ban.

## ❓ Questions?

- Open a [discussion](../../discussions)
- Comment on relevant issues
- Tag maintainers for guidance
- Join our Discord (coming soon)

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Mentioned in social media posts
- Added to CONTRIBUTORS.md

Thank you for helping make PennyPilot better! 🚀
