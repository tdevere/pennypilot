# 🚀 Getting Started with PennyPilot Development

Welcome to PennyPilot! This guide will help you get up and running quickly.

## ⚡ Quick Start (2 minutes)

### Windows Users

```powershell
# 1. Clone repository
git clone https://github.com/yourusername/expo_expense_tracker.git
cd expo_expense_tracker

# 2. Run automated setup
.\scripts\setup.ps1

# 3. Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-your-key-here

# 4. Start development
npx expo start --clear
```

### Mac/Linux Users

```bash
# 1. Clone repository
git clone https://github.com/yourusername/expo_expense_tracker.git
cd expo_expense_tracker

# 2. Install dependencies
npm install

# 3. Create .env file
echo "OPENAI_API_KEY=your_key_here" > .env

# 4. Start development
npx expo start --clear
```

---

## 📋 What to Work On

### 🔥 Top Priority (MVP Blockers)

These features are critical for marketplace launch:

1. **Budget Management** (Issue #1)
   - 5-7 days
   - Set monthly budgets per category
   - Track spending vs budget
   - Over-budget alerts
   - **Start here!**

2. **Recurring Transactions** (Issue #2)
   - 3-4 days
   - Subscription tracking
   - Auto-create transactions
   - Manage upcoming bills

3. **Search & Filter** (Issue #3)
   - 2-3 days
   - Global search
   - Filter by category/date/amount
   - Sort options

### 📖 Where to Learn

- **[ROADMAP.md](ROADMAP.md)** - Complete feature roadmap with milestones
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and code style
- **[GitHub Issues](../../issues)** - Browse available tasks
- **[Project Board](../../projects)** - Visual progress tracking

---

## 🛠️ Development Workflow

### 1. Choose an Issue

```bash
# Browse issues on GitHub
# Look for labels: "good first issue", "help wanted", "priority: high"
```

### 2. Create Feature Branch

```bash
# Using automated tools (Windows)
.\scripts\dev-tools.ps1  # Select option 5

# Or manually
git checkout -b feature/1-budget-management
```

### 3. Make Changes

```bash
# Run dev server
npx expo start --clear

# Test on device
# Open Expo Go app and scan QR code

# Check TypeScript
npx tsc --noEmit
```

### 4. Commit & Push

```bash
# Commit with descriptive message
git commit -m "feat(budget): add monthly budget setting per category

Implements budget management feature with:
- Category-specific budget limits
- Budget vs actual comparison
- Over-budget warnings

Closes #1"

# Push to your fork
git push origin feature/1-budget-management
```

### 5. Create Pull Request

1. Go to GitHub
2. Click "Compare & pull request"
3. Fill out PR template
4. Reference issue: "Closes #1"
5. Wait for review

---

## 📚 Key Files to Know

### Screens (`src/screens/`)
- `TransactionsScreen.tsx` - Transaction list
- `AddTransactionScreen.tsx` - Add new transaction
- `EditTransactionScreen.tsx` - Edit existing transaction
- `ScanReceiptScreen.tsx` - AI receipt scanning
- `LineItemsScreen.tsx` - Manage line items
- `GoalsScreen.tsx` - Savings goals
- `ReportsScreen.tsx` - Interactive charts
- `SettingsScreen.tsx` - App settings

### Services (`src/services/`)
- `database.ts` - SQLite operations (CRUD)
- `openai.ts` - OpenAI Vision API integration

### Navigation (`src/navigation/`)
- `index.tsx` - React Navigation setup

### Types (`src/types/`)
- `index.ts` - TypeScript interfaces

---

## 🎯 Your First Contribution

### Option 1: Budget Management (Recommended)

**Why:** Most critical missing feature for MVP

**Files to create/modify:**
```
src/screens/BudgetScreen.tsx          # New screen
src/services/database.ts              # Add budget CRUD methods
src/types/index.ts                    # Add Budget interface
src/navigation/index.tsx              # Add Budget route
```

**Database changes:**
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**UI components needed:**
- Budget input form (category, amount)
- Budget list with progress bars
- Over-budget alerts
- Budget summary dashboard

### Option 2: Search & Filter (Easier)

**Why:** Improves usability significantly

**Files to modify:**
```
src/screens/TransactionsScreen.tsx    # Add search bar
src/services/database.ts              # Add search queries
```

**Features to implement:**
- Search bar component
- Filter by category dropdown
- Date range picker
- Amount range slider
- Sort options

### Option 3: Fix Bugs (Beginner Friendly)

Check [Issues with "bug" label](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22type%3A+bug%22)

---

## 🚀 Automation Tools

### Generate All GitHub Issues

```bash
# Prerequisites: GitHub CLI installed and authenticated
gh auth login

# Generate issues, milestones, and labels
node scripts/generate-issues.js

# This creates 15+ issues with:
# - Full descriptions
# - Implementation checklists
# - Time estimates
# - Priority labels
```

### Development Menu (Windows)

```powershell
# Interactive menu with all dev tools
.\scripts\dev-tools.ps1

# Options:
# 1. Start development server
# 2. Clear cache and restart
# 3. Run TypeScript checks
# 4. Generate GitHub issues
# 5. Create feature branch
# 6. Stop Expo processes
# 7. Update dependencies
```

---

## 🎓 Learning Resources

### React Native / Expo
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### SQLite
- [expo-sqlite docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQL Tutorial](https://www.sqlitetutorial.net/)

### OpenAI
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)

### React Native Charts
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- [Chart Examples](https://github.com/indiespirit/react-native-chart-kit#readme)

---

## 💡 Pro Tips

### Development
1. **Always clear cache** when switching branches: `npx expo start --clear`
2. **Test on real device** for best experience (camera, touch, performance)
3. **Use TypeScript** - let the compiler catch errors early
4. **Check existing code** before implementing - avoid duplication

### Git Workflow
1. **Pull latest changes** before starting: `git pull upstream main`
2. **Small commits** - one logical change per commit
3. **Descriptive messages** - explain why, not just what
4. **Reference issues** - use "Closes #X" in commit messages

### Code Quality
1. **Follow existing patterns** - consistency matters
2. **Add error handling** - wrap database/API calls in try/catch
3. **Handle empty states** - show helpful messages
4. **Test edge cases** - what if no data? what if API fails?

### Communication
1. **Comment on issues** before starting work (avoid duplicates)
2. **Ask questions** if requirements unclear
3. **Update progress** on long-running tasks
4. **Be patient** with code reviews

---

## 🎯 Success Metrics

### For Contributors
- [ ] First PR merged
- [ ] First feature completed
- [ ] First bug fixed
- [ ] Helped another contributor
- [ ] Added to CONTRIBUTORS.md

### For the Project
- [ ] 60% → 80% → 100% feature completion
- [ ] All MVP features implemented
- [ ] Zero critical bugs
- [ ] App Store submission ready
- [ ] First 100 users

---

## ❓ Need Help?

### Before Asking
1. Check [ROADMAP.md](ROADMAP.md) for context
2. Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
3. Search [existing issues](../../issues)
4. Review [closed PRs](../../pulls?q=is%3Apr+is%3Aclosed) for examples

### How to Ask
1. **Open a discussion** for general questions
2. **Comment on issues** for task-specific questions
3. **Tag maintainers** (@username) for urgent matters
4. **Be specific** - include code snippets, error messages, screenshots

### Common Questions

**Q: Where do I start?**
A: Check "good first issue" label or start with Budget Management (#1)

**Q: Can I work on feature X?**
A: Yes! Comment on the issue to claim it, then create a feature branch

**Q: My code doesn't follow the style**
A: That's okay! Reviewers will help - just do your best

**Q: How long should a PR take?**
A: Usually 1-3 days for review. Be patient and responsive to feedback

**Q: Can I add a feature not in the roadmap?**
A: Yes! Open an issue first to discuss - we're open to new ideas

---

## 🎉 Let's Build Something Amazing!

PennyPilot has the potential to help thousands of people take control of their finances while respecting their privacy.

**Your contribution matters** - whether it's code, documentation, design, or ideas.

Ready to start? Pick an issue and let's go! 🚀

---

**Quick Links:**
- [ROADMAP.md](ROADMAP.md) - Feature roadmap
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- [Issues](../../issues) - Available tasks
- [Pull Requests](../../pulls) - In-progress work
- [Discussions](../../discussions) - Questions and ideas

**Need Help?** Open a discussion or comment on an issue!

**Want Updates?** Watch the repository and join discussions!

Let's make personal finance privacy-first! 💰🔐
