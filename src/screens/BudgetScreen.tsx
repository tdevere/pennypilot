import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { databaseService } from '../services/database';
import { Budget, BudgetProgress } from '../types';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import {
  getCurrentMonth,
  getCurrentYear,
  formatMonthDisplay,
  formatCurrency,
} from '../utils/budgetCalculations';

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [progressList, setProgressList] = useState<BudgetProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [totalSummary, setTotalSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    percentage: 0,
    remaining: 0,
  });

  // Modal state for adding/editing budgets
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Common categories for quick selection
  const commonCategories = [
    'Food',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Education',
    'Savings',
    'Other',
  ];

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const budgetData = await databaseService.getBudgetsByMonth(month, year);
      const progress = await databaseService.getAllBudgetProgress(month, year);
      const summary = await databaseService.getTotalBudgetSummary(month, year);

      setBudgets(budgetData);
      setProgressList(progress);
      setTotalSummary(summary);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [month, year])
  );

  const handleAddBudget = async () => {
    if (!newCategory.trim() || !newAmount.trim()) {
      Alert.alert('Error', 'Please enter both category and amount');
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await databaseService.addBudget({
        category: newCategory.trim(),
        amount,
        month,
        year,
      });

      setNewCategory('');
      setNewAmount('');
      setShowAddModal(false);
      loadBudgets();
      Alert.alert('Success', 'Budget added successfully');
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to add budget');
    }
  };

  const handleUpdateBudget = async (budget: Budget) => {
    Alert.prompt(
      'Update Budget',
      `Enter new amount for ${budget.category}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (text?: string) => {
            const amount = parseFloat(text || '0');
            if (isNaN(amount) || amount <= 0) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }

            try {
              await databaseService.updateBudget(budget.id, amount);
              loadBudgets();
              Alert.alert('Success', 'Budget updated');
            } catch (error) {
              console.error('Error updating budget:', error);
              Alert.alert('Error', 'Failed to update budget');
            }
          },
        },
      ],
      'plain-text',
      budget.amount.toString()
    );
  };

  const handleDeleteBudget = async (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for ${budget.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteBudget(budget.id);
              loadBudgets();
              Alert.alert('Success', 'Budget deleted');
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [currentYear, currentMonth] = month.split('-').map(Number);
    let newYear = currentYear;
    let newMonth = currentMonth;

    if (direction === 'next') {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    } else {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    }

    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setMonth(newMonthStr);
    setYear(newYear);
  };

  const getTotalStatusColor = () => {
    if (totalSummary.percentage >= 100) return '#991b1b';
    if (totalSummary.percentage >= 90) return '#ef4444';
    if (totalSummary.percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget Manager</Text>
        <Text style={styles.headerSubtitle}>Track your spending limits</Text>
      </View>

      {/* Month Navigator */}
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthDisplay}>{formatMonthDisplay(month)}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Total Summary Card */}
      {totalSummary.totalBudget > 0 && (
        <View style={[styles.summaryCard, { borderLeftColor: getTotalStatusColor() }]}>
          <Text style={styles.summaryTitle}>Total Budget Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSummary.totalBudget)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spent:</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              {formatCurrency(totalSummary.totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining:</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalSummary.remaining >= 0 ? '#10b981' : '#ef4444' },
              ]}
            >
              {formatCurrency(Math.abs(totalSummary.remaining))}
            </Text>
          </View>
          <View style={styles.summaryProgressBar}>
            <View
              style={[
                styles.summaryProgressFill,
                {
                  width: `${Math.min(totalSummary.percentage, 100)}%`,
                  backgroundColor: getTotalStatusColor(),
                },
              ]}
            />
          </View>
          <Text style={[styles.summaryPercentage, { color: getTotalStatusColor() }]}>
            {totalSummary.percentage.toFixed(1)}% of total budget used
          </Text>
        </View>
      )}

      {/* Budget List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {progressList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💰</Text>
            <Text style={styles.emptyStateTitle}>No Budgets Set</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your spending by creating budgets for different categories.
            </Text>
          </View>
        ) : (
          progressList.map((progress, index) => (
            <TouchableOpacity
              key={`${progress.category}-${index}`}
              onLongPress={() => {
                const budget = budgets.find((b) => b.category === progress.category);
                if (budget) {
                  Alert.alert('Budget Options', `Manage ${budget.category} budget`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit Amount', onPress: () => handleUpdateBudget(budget) },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteBudget(budget) },
                  ]);
                }
              }}
            >
              <BudgetProgressBar progress={progress} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Budget Button */}
      {!showAddModal ? (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add Budget</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addModal}>
          <Text style={styles.modalTitle}>Add New Budget</Text>

          <Text style={styles.inputLabel}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Food, Transportation"
            value={newCategory}
            onChangeText={setNewCategory}
          />

          <Text style={styles.inputLabel}>Quick Select:</Text>
          <View style={styles.categoryGrid}>
            {commonCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  newCategory === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setNewCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    newCategory === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Budget Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowAddModal(false);
                setNewCategory('');
                setNewAmount('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveButtonText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 4,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  monthDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryProgressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addModal: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryChipSelected: {
    backgroundColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
