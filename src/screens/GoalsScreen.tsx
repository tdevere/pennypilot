import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Goal } from '../types';
import { databaseService } from '../services/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GoalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadGoals = async () => {
    try {
      const data = await databaseService.getAllGoals();
      setGoals(data as Goal[]);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const handleAddContribution = (goal: Goal) => {
    Alert.prompt(
      'Add Contribution',
      `How much would you like to add to "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (value?: string) => {
            const amount = parseFloat(value || '0');
            if (amount > 0) {
              const newAmount = goal.currentAmount + amount;
              await databaseService.updateGoalProgress(goal.id, newAmount);
              await loadGoals();
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await databaseService.deleteGoal(goal.id);
            await loadGoals();
          },
        },
      ]
    );
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = getProgressPercentage(item);
    const daysLeft = getDaysRemaining(item.deadline);
    const isCompleted = item.currentAmount >= item.targetAmount;
    const isOverdue = daysLeft < 0 && !isCompleted;

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <Text style={styles.goalName}>{item.name}</Text>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteGoal(item)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.currentAmount}>{formatCurrency(item.currentAmount)}</Text>
          <Text style={styles.targetAmount}>of {formatCurrency(item.targetAmount)}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>
          <Text style={[
            styles.deadlineText,
            isOverdue && styles.overdueText
          ]}>
            {isOverdue 
              ? `${Math.abs(daysLeft)} days overdue`
              : isCompleted
              ? '✓ Goal reached!'
              : `${daysLeft} days left`
            }
          </Text>
        </View>

        {!isCompleted && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddContribution(item)}
          >
            <Ionicons name="add-circle" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Contribution</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptySubtitle}>
              Set financial goals and track your progress
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddGoal')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  goalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  targetAmount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  deadlineText: {
    fontSize: 14,
    color: '#666',
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#999',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
