# 💰 PennyPilot - Privacy-First Expense Tracker

> *Track every penny without sharing your bank credentials*

A cross-platform personal finance app built with **Expo/React Native** featuring AI-powered receipt scanning, budget management, goals tracking, and interactive reports.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2051-blue.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Vision

**Privacy-First:** All your financial data stays on your device. No bank linking. No cloud sync (unless you want it). No tracking.

**AI-Powered:** Scan receipts with OpenAI Vision API to automatically extract transactions, line items, and merchant details.

**Goal-Oriented:** Set savings goals, track progress, and achieve your financial dreams.

---

## 🚀 Quick Start

### One-Click Setup (Windows)

```powershell
# Run automated setup
.\scripts\setup.ps1

# Or use dev tools menu
.\scripts\dev-tools.ps1
```

### Manual Setup

#### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (included with Node.js)
- Expo Go app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- (Optional) GitHub CLI for issue generation ([Download](https://cli.github.com/))

#### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/expo_expense_tracker.git
cd expo_expense_tracker

# Install dependencies
npm install

# Create environment file
echo "OPENAI_API_KEY=your_key_here" > .env

# Start development server
npx expo start --clear
```

### Running the App

**📱 On Your Phone (Recommended)**
1. Open **Expo Go** app on your device
2. Scan the QR code from terminal
3. App loads instantly!

**🖥️ Android Emulator**
```bash
npx expo start --android
```

**🌐 Web Browser**
```bash
npx expo start --web
```

---

## ✨ Features

### 🎉 Current Features (v0.6.0)

#### 💳 Transaction Management
- ✅ Add income/expense transactions manually
- ✅ AI-powered receipt scanning (OpenAI Vision API)
- ✅ Line item tracking for receipts
- ✅ Edit/delete transactions
- ✅ Category-based organization (8 categories)
- ✅ Merchant detection
- ✅ Exclude transactions from reports

#### 📸 AI Receipt Scanning
- ✅ Scan receipts with camera or gallery
- ✅ Automatic extraction of:
  - Merchant name
  - Transaction date
  - Total amount
  - Individual line items (name, quantity, price)
  - Category suggestion
- ✅ View/edit line items for any transaction

#### 📊 Interactive Reports
- ✅ Multiple chart types (Pie, Bar, List)
- ✅ Category-based spending breakdown
- ✅ Date range filtering
- ✅ Interactive category selection
- ✅ Expandable transaction lists
- ✅ Income vs Expense summary

#### 🎯 Financial Goals
- ✅ Create savings goals with target amounts
- ✅ Set deadlines for goals
- ✅ Track progress with visual indicators
- ✅ Add contributions manually
- ✅ Goal completion tracking

#### 📤 Privacy-First Data Sharing
- ✅ Export transactions to base64 text
- ✅ Manual sharing via clipboard
- ✅ No automatic cloud sync
- ✅ Local SQLite storage only
- ✅ Full data ownership

### 🚧 Coming Soon (MVP Features)

See [ROADMAP.md](ROADMAP.md) for detailed development plan.

#### 🎯 Milestone 1: MVP Core Features (Weeks 1-2)
- [ ] **Budget Management** - Set monthly budgets per category with alerts
- [ ] **Recurring Transactions** - Auto-create subscriptions and bills
- [ ] **Search & Filter** - Find transactions quickly
- [ ] Income vs Expense Analytics
- [ ] Savings Rate Calculator

#### 👤 Milestone 2: Essential User Features (Weeks 3-4)
- [ ] **Welcome Tutorial** - Onboard new users effectively
- [ ] Advanced Filtering
- [ ] Tags & Custom Categories
- [ ] Multi-Currency Support
- [ ] Receipt Image Storage

#### 🔐 Milestone 3: Security & Data Management (Weeks 5-6)
- [ ] **Biometric Authentication** - Face ID, Touch ID, Fingerprint
- [ ] PIN Code Lock
- [ ] Encrypted Backups
- [ ] Cloud Backup (Premium)
- [ ] Import/Export CSV

#### 🎨 Milestone 4: Polish & UX (Weeks 7-8)
- [ ] **Dark Mode** - Full theme support
- [ ] Professional App Icon
- [ ] Animations & Haptics
- [ ] Accessibility Features
- [ ] Performance Optimization

---

## 📚 Documentation

- **[ROADMAP.md](ROADMAP.md)** - Complete product roadmap and milestones
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/)** - Issue templates for bugs/features

---

## 🛠️ Tech Stack

- **Frontend:** React Native with Expo SDK 51+
- **Language:** TypeScript
- **Navigation:** React Navigation 6.x
- **Database:** SQLite (expo-sqlite)
- **AI:** OpenAI GPT-4o-mini Vision API
- **Charts:** react-native-chart-kit
- **Camera:** expo-image-picker
- **State:** React Context + Hooks

---

## 📂 Project Structure

```
expo_expense_tracker/
├── src/
│   ├── navigation/          # React Navigation setup
│   ├── screens/             # All app screens
│   │   ├── TransactionsScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── EditTransactionScreen.tsx
│   │   ├── ScanReceiptScreen.tsx
│   │   ├── LineItemsScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Business logic
│   │   ├── database.ts      # SQLite operations
│   │   └── openai.ts        # OpenAI API integration
│   └── types/               # TypeScript definitions
├── assets/                  # Images, fonts, etc.
├── scripts/                 # Automation scripts
│   ├── setup.ps1           # Windows setup script
│   ├── dev-tools.ps1       # Development tools menu
│   └── generate-issues.js  # GitHub issue generator
├── .github/                 # GitHub templates & workflows
│   ├── ISSUE_TEMPLATE/     # Bug/feature templates
│   └── workflows/          # CI/CD automation
├── ROADMAP.md              # Product roadmap
├── CONTRIBUTING.md         # Contribution guide
└── README.md               # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines
2. **Check [ROADMAP.md](ROADMAP.md)** for planned features
3. **Browse [Issues](../../issues)** for open tasks
4. **Fork & Create Branch**: `git checkout -b feature/your-feature`
5. **Make Changes & Test**
6. **Submit Pull Request** with issue reference

### Quick Commands

```powershell
# Windows: Use dev tools menu
.\scripts\dev-tools.ps1

# Create feature branch
git checkout -b feature/1-budget-management

# Run TypeScript checks
npx tsc --noEmit

# Stop all Expo processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Generate GitHub issues from roadmap
node scripts/generate-issues.js
```

---

## 🎯 Why PennyPilot?

### 🔐 Privacy-First
- **No Bank Linking** - Your credentials stay yours
- **Local Storage** - All data on your device
- **Manual Sharing Only** - You control your data
- **No Tracking** - We don't collect analytics (yet)

### 🤖 AI-Powered Intelligence
- **Receipt Scanning** - Snap a photo, get the transaction
- **Line Item Extraction** - Track what you bought, not just how much
- **Smart Categorization** - AI suggests categories
- **Merchant Detection** - Automatic merchant identification

### 🎯 Goal-Oriented Planning
- **Visual Progress** - See your goals come to life
- **Multiple Goals** - Save for many things at once
- **Deadline Tracking** - Stay motivated with timelines
- **Contribution History** - Track every step

### 📊 Insightful Analytics
- **Interactive Charts** - Pie, bar, and list views
- **Category Breakdown** - Know where money goes
- **Date Filtering** - Analyze any time period
- **Exclude Options** - Focus on what matters

---

## 💰 Monetization (Planned)

### Free Tier
- 10 AI receipt scans/month
- Unlimited manual transactions
- Basic reports
- 1 savings goal
- Local data only

### Premium ($3.99/month or $39.99/year)
- Unlimited AI receipt scans
- Unlimited goals
- Advanced analytics
- Budget alerts
- Export to CSV/Excel
- Priority support
- Optional cloud backup
- Receipt image storage

---

## 📈 Roadmap Status

| Feature Category | Progress | Status |
|-----------------|----------|--------|
| Transaction Management | ████████░░ | 80% |
| AI Receipt Scanning | ████████░░ | 80% |
| Goals & Savings | ███████░░░ | 70% |
| Reports & Analytics | ███████░░░ | 70% |
| **Budget Management** | ░░░░░░░░░░ | 0% - **Next Priority** |
| User Onboarding | ░░░░░░░░░░ | 0% |
| Security Features | ░░░░░░░░░░ | 0% |
| Dark Mode | ░░░░░░░░░░ | 0% |
| App Store Prep | ░░░░░░░░░░ | 0% |

**Overall Progress:** 60% ready for marketplace launch

See [ROADMAP.md](ROADMAP.md) for detailed timeline and milestones.

---

## 🐛 Known Issues

- No budget management system (top priority)
- No search/filter functionality
- No biometric authentication
- No dark mode
- No onboarding tutorial
- Limited categories (8 fixed categories)
- No recurring transactions
- No data backup/restore

See [Issues](../../issues) for full bug list and feature requests.

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](../../issues)
- **Discussions:** [GitHub Discussions](../../discussions)
- **Email:** support@pennypilot.app (Coming soon)
- **Website:** https://pennypilot.app (Coming soon)

---
  - Persistent data storage

### 🚧 Coming Soon
- Goals tracking with progress indicators
- Reports with charts and spending analysis
- Settings (theme, backup/restore, API configuration)

## 📁 Project Structure

```
expo_expense_tracker/
├── src/
│   ├── navigation/       # React Navigation setup
│   │   └── index.tsx
│   ├── screens/          # All screen components
│   │   ├── TransactionsScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # Business logic
│   │   └── database.ts   # SQLite service
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx               # Entry point
└── package.json
```

## 🛠️ Tech Stack

- **Expo SDK 51+** - Development framework
- **React Native** - Mobile UI framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
  - Bottom Tabs Navigator
  - Native Stack Navigator
- **Expo SQLite** - Local database
- **Expo Vector Icons** - Icon library

## 📱 Development Tips

### Hot Reload
- Shake your phone or press `r` in terminal to reload
- Changes appear instantly (no rebuild needed!)

### Debugging
- Press `j` in terminal to open debugger
- Use Chrome DevTools for debugging
- Console logs appear in terminal

### Common Commands
```bash
npm start          # Start dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator (Mac only)
npm run web        # Run in web browser
```

## 🔄 Migration from Android

This Expo version replaces the native Android (Kotlin/Jetpack Compose) version with these benefits:

| Feature | Native Android | Expo/React Native |
|---------|---------------|-------------------|
| **Platform Support** | Android only | iOS + Android + Web |
| **Build Time** | 30-60 seconds | Instant (hot reload) |
| **Learning Curve** | Steep | Moderate |
| **Development Speed** | Slow | **3-5x faster** |
| **Testing** | Emulator only | **Phone + Emulator + Web** |

### Same Features, Better DX
- ✅ SQLite database (same as Room)
- ✅ Bottom navigation (cleaner API)
- ✅ Transaction CRUD operations
- ✅ Material Design-inspired UI
- ✅ TypeScript type safety

## 📊 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,           -- ISO 8601 format
  type TEXT NOT NULL,            -- 'INCOME' or 'EXPENSE'
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

## 🎨 Customization

## 🔧 Development

### Environment Setup

The app uses OpenAI API for receipt scanning. Get your API key:
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Create API key in [API Keys section](https://platform.openai.com/api-keys)
3. Add to `.env` file:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

### Automated Development Tools

```powershell
# Windows: Interactive menu
.\scripts\dev-tools.ps1

# Available options:
# 1. Start development server
# 2. Clear cache and restart
# 3. Run TypeScript checks
# 4. Generate GitHub issues from roadmap
# 5. Create new feature branch
# 6. Stop all Expo processes
# 7. Update dependencies
```

### Manual Commands

```bash
# Start with cache clear
npx expo start --clear

# TypeScript validation
npx tsc --noEmit

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Stop all Expo processes (Windows)
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Creating GitHub Issues

```bash
# Prerequisites: Install GitHub CLI
# Windows: winget install --id GitHub.cli

# Authenticate
gh auth login

# Generate all roadmap issues automatically
node scripts/generate-issues.js

# This creates:
# - Milestones (MVP, Essential Features, Security, etc.)
# - Labels (priority, type, milestone)
# - Issues with full descriptions and checklists
```

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module" errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

**Database not persisting**
- Check `databaseService.init()` is called in `App.tsx`
- Delete app from device and reinstall
- Check console for database errors

**QR code not scanning**
- Ensure phone and computer on same network
- Try typing URL manually in Expo Go
- Check firewall settings

**TypeScript errors**
```bash
# Check for errors
npx tsc --noEmit

# Update TypeScript
npm update typescript
```

**Expo cache issues**
```bash
# Clear all caches
npx expo start --clear
```

---

## 📦 Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for both platforms
eas build --platform all
```

### App Store Submission Checklist

See [ROADMAP.md - Milestone 5](ROADMAP.md#milestone-5-app-store-preparation) for complete checklist:
- [ ] Privacy Policy & Terms of Service
- [ ] App Store screenshots (5-8 per platform)
- [ ] App preview video (30-60 seconds)
- [ ] App description & keywords (ASO)
- [ ] App icon (all sizes)
- [ ] Analytics integration
- [ ] Crash reporting
- [ ] Beta testing (TestFlight/Google Play Beta)

---

## 📄 License

MIT

---

**Built with ❤️ using Expo** | [Documentation](https://docs.expo.dev/) | [React Navigation](https://reactnavigation.org/)
