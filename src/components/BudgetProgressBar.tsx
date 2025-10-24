import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BudgetProgress } from '../types';
import { getBudgetStatusColor, getBudgetStatusEmoji, formatCurrency } from '../utils/budgetCalculations';

interface BudgetProgressBarProps {
  progress: BudgetProgress;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ progress }) => {
  const statusColor = getBudgetStatusColor(progress.status);
  const emoji = getBudgetStatusEmoji(progress.status);
  const displayPercentage = Math.min(progress.percentage, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>
          {emoji} {progress.category}
        </Text>
        <Text style={styles.percentage}>
          {progress.percentage.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${displayPercentage}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amounts}>
          <Text style={styles.spent}>{formatCurrency(progress.spent)}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.budget}>{formatCurrency(progress.budget)}</Text>
        </Text>
        <Text
          style={[
            styles.remaining,
            { color: progress.remaining >= 0 ? '#10b981' : '#ef4444' },
          ]}
        >
          {progress.remaining >= 0 ? 'Remaining: ' : 'Over by: '}
          {formatCurrency(Math.abs(progress.remaining))}
        </Text>
      </View>

      {progress.status !== 'healthy' && (
        <View style={[styles.alert, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.alertText, { color: statusColor }]}>
            {progress.status === 'over' && '🚨 Budget exceeded!'}
            {progress.status === 'critical' && '🔴 Approaching budget limit'}
            {progress.status === 'warning' && '⚠️ Watch your spending'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amounts: {
    fontSize: 14,
  },
  spent: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  separator: {
    color: '#9ca3af',
  },
  budget: {
    color: '#6b7280',
  },
  remaining: {
    fontSize: 14,
    fontWeight: '600',
  },
  alert: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
