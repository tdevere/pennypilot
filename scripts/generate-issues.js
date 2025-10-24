#!/usr/bin/env node

/**
 * GitHub Issue Generator for PennyPilot Roadmap
 * 
 * This script creates GitHub issues automatically from the ROADMAP.md
 * Run: node scripts/generate-issues.js
 * 
 * Requirements:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 3. Run from project root
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Roadmap items to create as GitHub issues
const issues = [
  // Milestone 1: MVP Core Features
  {
    title: 'Budget Management System',
    number: 1,
    milestone: 'MVP Core Features',
    labels: ['type: feature', 'priority: critical', 'milestone: mvp'],
    body: `## 📋 Description
Implement comprehensive budget management system allowing users to set monthly budgets per category and track spending against those limits.

## 🎯 Success Criteria
- [ ] Set monthly budget limits per category
- [ ] Display budget vs actual spending
- [ ] Show visual progress bars for each category
- [ ] Alert when approaching budget limit (80%, 90%, 100%)
- [ ] Display total budget vs total spending
- [ ] Edit/delete budget limits
- [ ] Persist budget settings across months

## 📋 Implementation Checklist

### Database
- [ ] Create \`budgets\` table (category, amount, month, year)
- [ ] Add migration script
- [ ] CRUD operations for budgets

### UI/UX
- [ ] Budget settings screen
- [ ] Category budget input forms
- [ ] Budget progress indicators on Reports screen
- [ ] Over-budget warning alerts
- [ ] Budget summary dashboard

### Logic
- [ ] Calculate spent vs budget per category
- [ ] Percentage calculations
- [ ] Alert threshold logic (80%, 90%, 100%)
- [ ] Month-over-month budget tracking

## 💡 Design Notes
- Use progress bars with color coding (green < 80%, yellow 80-90%, red > 90%)
- Add haptic feedback for over-budget warnings
- Consider budget recommendations based on historical spending

## ⏱️ Estimated Time
5-7 days

## 🔗 References
- Part of Milestone 1: MVP Core Features
- Critical for marketplace launch
- Competitor analysis: YNAB, Mint budgeting features`
  },
  
  {
    title: 'Recurring Transactions',
    number: 2,
    milestone: 'MVP Core Features',
    labels: ['type: feature', 'priority: high', 'milestone: mvp'],
    body: `## 📋 Description
Add support for recurring transactions (subscriptions, bills, salary) with automatic creation and management.

## 🎯 Success Criteria
- [ ] Create recurring transaction templates
- [ ] Set frequency (daily, weekly, monthly, yearly, custom)
- [ ] Auto-generate transactions on schedule
- [ ] Manage upcoming recurring transactions
- [ ] Skip or modify individual occurrences
- [ ] Track subscription costs
- [ ] Reminder notifications (optional)

## 📋 Implementation Checklist

### Database
- [ ] Create \`recurring_transactions\` table
- [ ] Fields: template_id, amount, category, frequency, next_date, end_date
- [ ] Link to generated transactions

### Automation
- [ ] Background job to check for due recurring transactions
- [ ] Auto-create transactions on schedule
- [ ] Update next_date after creation
- [ ] Handle skipped occurrences

### UI
- [ ] Recurring transactions list screen
- [ ] Add/edit recurring transaction form
- [ ] Calendar view of upcoming recurring items
- [ ] Badge indicator for recurring transactions
- [ ] Quick actions (skip, modify, delete)

## ⏱️ Estimated Time
3-4 days`
  },

  {
    title: 'Search & Filter Functionality',
    number: 3,
    milestone: 'MVP Core Features',
    labels: ['type: feature', 'priority: high', 'milestone: mvp'],
    body: `## 📋 Description
Implement comprehensive search and filtering system for transactions.

## 🎯 Success Criteria
- [ ] Global search bar
- [ ] Search by merchant, description, amount
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Filter by amount range
- [ ] Sort options (date, amount, category)
- [ ] Save frequent searches
- [ ] Search results highlighting

## 📋 Implementation Checklist

### Database
- [ ] Optimize queries for search performance
- [ ] Add indexes on searchable columns
- [ ] Full-text search for descriptions

### UI
- [ ] Search bar component
- [ ] Filter drawer/modal
- [ ] Sort options menu
- [ ] Clear filters button
- [ ] Search result count
- [ ] Empty state for no results

### Features
- [ ] Debounced search input
- [ ] Recent searches
- [ ] Search suggestions
- [ ] Filter chips (removable tags)
- [ ] Advanced filter options

## ⏱️ Estimated Time
2-3 days`
  },

  // Milestone 2: Essential User Features
  {
    title: 'Welcome Screen & Tutorial',
    number: 6,
    milestone: 'Essential User Features',
    labels: ['type: feature', 'priority: high', 'milestone: v1.0'],
    body: `## 📋 Description
Create engaging onboarding experience for new users with tutorial and quick-start wizard.

## 🎯 Success Criteria
- [ ] Welcome screen with app value proposition
- [ ] 3-slide tutorial covering key features
- [ ] Interactive feature walkthrough
- [ ] Optional quick-start wizard
- [ ] Skip option for experienced users
- [ ] Never show again preference

## 📋 Implementation Checklist

### Screens
- [ ] Welcome splash screen
- [ ] Tutorial slides (AI scanning, goals, reports)
- [ ] Quick-start wizard
- [ ] Feature highlights with animations

### Storage
- [ ] Track onboarding completion
- [ ] Save user preferences
- [ ] Skip tutorial flag

### Design
- [ ] Illustrations for each slide
- [ ] Smooth transitions
- [ ] Progress indicators
- [ ] Call-to-action buttons

## ⏱️ Estimated Time
3-5 days`
  },

  {
    title: 'Advanced Filtering System',
    number: 10,
    milestone: 'Essential User Features',
    labels: ['type: feature', 'priority: medium', 'milestone: v1.0'],
    body: `## 📋 Description
Enhance filtering capabilities with advanced options and saved filter presets.

## 🎯 Success Criteria
- [ ] Multiple simultaneous filters
- [ ] Date range picker
- [ ] Amount range slider
- [ ] Tag-based filtering
- [ ] Exclude from reports filter
- [ ] Save filter presets
- [ ] Quick filter shortcuts

## ⏱️ Estimated Time
2-3 days`
  },

  // Milestone 3: Security & Data Management
  {
    title: 'Biometric Authentication',
    number: 15,
    milestone: 'Security & Data Management',
    labels: ['type: feature', 'priority: critical', 'milestone: v1.0'],
    body: `## 📋 Description
Implement biometric authentication (Face ID, Touch ID, Fingerprint) for app security.

## 🎯 Success Criteria
- [ ] Face ID support (iOS)
- [ ] Touch ID support (iOS)
- [ ] Fingerprint support (Android)
- [ ] Fallback to PIN code
- [ ] Auto-lock after inactivity
- [ ] Settings to enable/disable
- [ ] Timeout configuration (immediate, 1min, 5min, 15min)

## 📋 Implementation Checklist

### Libraries
- [ ] Install expo-local-authentication
- [ ] Install expo-secure-store

### Features
- [ ] Check device biometric support
- [ ] Biometric authentication flow
- [ ] PIN code creation/verification
- [ ] Auto-lock timer
- [ ] Lock screen UI
- [ ] Settings screen integration

### Security
- [ ] Secure storage for PIN
- [ ] Encryption for sensitive data
- [ ] Session management
- [ ] Background app behavior

## ⏱️ Estimated Time
3-4 days`
  },

  {
    title: 'Automated Backups & Restore',
    number: 20,
    milestone: 'Security & Data Management',
    labels: ['type: feature', 'priority: high', 'milestone: v1.0'],
    body: `## 📋 Description
Implement automated backup system with easy restore functionality.

## 🎯 Success Criteria
- [ ] Automatic daily backups
- [ ] Manual backup trigger
- [ ] Local backup storage
- [ ] Cloud backup (Premium feature)
- [ ] Restore from backup
- [ ] Backup encryption
- [ ] Backup management (view, delete old backups)

## ⏱️ Estimated Time
3-4 days`
  },

  // Milestone 4: Polish & UX
  {
    title: 'Professional App Icon Design',
    number: 25,
    milestone: 'Polish & UX',
    labels: ['type: enhancement', 'priority: high', 'milestone: v1.0'],
    body: `## 📋 Description
Design and implement professional app icon for all platforms and sizes.

## 🎯 Success Criteria
- [ ] Original app icon design
- [ ] All required sizes (iOS, Android)
- [ ] Adaptive icon (Android)
- [ ] App Store icon
- [ ] Splash screen
- [ ] Notification icon
- [ ] Consistent branding

## 🎨 Design Direction
- Minimalist coin or wallet icon
- Green/blue color scheme
- Professional and trustworthy
- Recognizable at small sizes

## ⏱️ Estimated Time
1-2 days`
  },

  {
    title: 'Dark Mode Support',
    number: 27,
    milestone: 'Polish & UX',
    labels: ['type: feature', 'priority: medium', 'milestone: v1.0'],
    body: `## 📋 Description
Implement full dark mode support with theme switching.

## 🎯 Success Criteria
- [ ] Dark color scheme design
- [ ] Theme provider setup
- [ ] All screens support dark mode
- [ ] Charts work in dark mode
- [ ] Settings toggle for theme
- [ ] System theme detection
- [ ] Smooth theme transitions

## ⏱️ Estimated Time
3-4 days`
  },

  // Milestone 5: App Store Preparation
  {
    title: 'Privacy Policy & Terms of Service',
    number: 36,
    milestone: 'App Store Preparation',
    labels: ['type: documentation', 'priority: critical'],
    body: `## 📋 Description
Create comprehensive legal documents required for app store submission.

## 🎯 Success Criteria
- [ ] Privacy Policy document
- [ ] Terms of Service document
- [ ] Data collection disclosure
- [ ] OpenAI API usage disclosure
- [ ] User rights explanation
- [ ] Contact information
- [ ] Legal review (if possible)
- [ ] Hosted on website

## ⏱️ Estimated Time
2-3 days`
  },

  {
    title: 'App Store Screenshots & Preview',
    number: 40,
    milestone: 'App Store Preparation',
    labels: ['type: documentation', 'priority: high'],
    body: `## 📋 Description
Create professional app store screenshots and preview video.

## 🎯 Success Criteria
- [ ] 5-8 screenshots per platform
- [ ] All required device sizes
- [ ] Feature callouts on screenshots
- [ ] 30-60 second preview video
- [ ] Captions for video
- [ ] Professional editing
- [ ] Consistent visual style

## ⏱️ Estimated Time
2-3 days`
  },

  {
    title: 'Analytics & Crash Reporting Integration',
    number: 44,
    milestone: 'App Store Preparation',
    labels: ['type: feature', 'priority: high'],
    body: `## 📋 Description
Integrate analytics and crash reporting for production monitoring.

## 🎯 Success Criteria
- [ ] Analytics platform setup (Firebase/Mixpanel)
- [ ] Track key user events
- [ ] Crash reporting (Sentry)
- [ ] Performance monitoring
- [ ] Privacy-compliant tracking
- [ ] User opt-out option
- [ ] Dashboard setup

## ⏱️ Estimated Time
2-3 days`
  }
];

// Milestone configurations
const milestones = {
  'MVP Core Features': {
    title: 'MVP Core Features',
    description: 'Core functionality required for marketplace launch',
    dueDate: '2026-01-15',
  },
  'Essential User Features': {
    title: 'Essential User Features',
    description: 'User experience enhancements and onboarding',
    dueDate: '2026-01-29',
  },
  'Security & Data Management': {
    title: 'Security & Data Management',
    description: 'Security features and data protection',
    dueDate: '2026-02-12',
  },
  'Polish & UX': {
    title: 'Polish & UX',
    description: 'Visual polish and user experience refinements',
    dueDate: '2026-02-26',
  },
  'App Store Preparation': {
    title: 'App Store Preparation',
    description: 'Preparation for app store submission',
    dueDate: '2026-03-12',
  },
};

// Helper function to run shell commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Check if GitHub CLI is installed
function checkGitHubCLI() {
  const result = runCommand('gh --version');
  if (!result) {
    console.error('❌ GitHub CLI not found. Please install: https://cli.github.com/');
    process.exit(1);
  }
  console.log('✅ GitHub CLI found');
}

// Check if authenticated
function checkAuthentication() {
  const result = runCommand('gh auth status');
  if (!result || result.includes('not logged in')) {
    console.error('❌ Not authenticated. Run: gh auth login');
    process.exit(1);
  }
  console.log('✅ Authenticated with GitHub');
}

// Create milestones
function createMilestones() {
  console.log('\n📋 Creating milestones...\n');
  
  for (const [key, milestone] of Object.entries(milestones)) {
    const command = `gh api repos/:owner/:repo/milestones -f title="${milestone.title}" -f description="${milestone.description}" -f due_on="${milestone.dueDate}T23:59:59Z"`;
    const result = runCommand(command);
    
    if (result) {
      console.log(`✅ Created milestone: ${milestone.title}`);
    } else {
      console.log(`ℹ️  Milestone may already exist: ${milestone.title}`);
    }
  }
}

// Create issues
function createIssues() {
  console.log('\n📝 Creating issues...\n');
  
  for (const issue of issues) {
    const labels = issue.labels.join(',');
    const body = issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    const command = `gh issue create --title "${issue.title}" --body "${body}" --label "${labels}"`;
    const result = runCommand(command);
    
    if (result) {
      console.log(`✅ Created issue #${issue.number}: ${issue.title}`);
    } else {
      console.log(`❌ Failed to create issue: ${issue.title}`);
    }
  }
}

// Create labels
function createLabels() {
  console.log('\n🏷️  Creating labels...\n');
  
  const labels = [
    { name: 'priority: critical', color: 'e11d21', description: 'Critical priority' },
    { name: 'priority: high', color: 'eb6420', description: 'High priority' },
    { name: 'priority: medium', color: 'fbca04', description: 'Medium priority' },
    { name: 'priority: low', color: '009800', description: 'Low priority' },
    { name: 'type: feature', color: '0052cc', description: 'New feature' },
    { name: 'type: bug', color: 'd93f0b', description: 'Bug fix' },
    { name: 'type: enhancement', color: '5319e7', description: 'Enhancement' },
    { name: 'type: documentation', color: '0075ca', description: 'Documentation' },
    { name: 'milestone: mvp', color: 'c5def5', description: 'MVP milestone' },
    { name: 'milestone: v1.0', color: 'c5def5', description: 'v1.0 milestone' },
    { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
    { name: 'help wanted', color: '008672', description: 'Help needed' },
  ];
  
  for (const label of labels) {
    const command = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`;
    runCommand(command);
  }
  
  console.log('✅ Labels created/updated');
}

// Main execution
function main() {
  console.log('🚀 PennyPilot GitHub Issue Generator\n');
  
  checkGitHubCLI();
  checkAuthentication();
  createLabels();
  createMilestones();
  createIssues();
  
  console.log('\n✨ All done! Check your GitHub repository.\n');
  console.log('Next steps:');
  console.log('1. Review created issues');
  console.log('2. Assign team members');
  console.log('3. Start working on MVP features');
  console.log('4. Update progress in ROADMAP.md\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { issues, milestones };
