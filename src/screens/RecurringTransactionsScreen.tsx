import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RecurringTransaction, RootStackParamList } from '../types';
import { databaseService } from '../services/database';
import { recurringTransactionService } from '../services/recurringTransactionService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RecurringTransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecurringTransactions = async () => {
    try {
      const data = await databaseService.getAllRecurringTransactions();
      setRecurringTransactions(data);
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecurringTransactions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecurringTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    try {
      await databaseService.toggleRecurringTransactionActive(recurring.id);
      await loadRecurringTransactions();
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
      Alert.alert('Error', 'Failed to update recurring transaction');
    }
  };

  const handleDelete = (recurring: RecurringTransaction) => {
    Alert.alert(
      'Delete Recurring Transaction',
      `Are you sure you want to delete "${recurring.description}"? This will not affect transactions that have already been generated.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteRecurringTransaction(recurring.id);
              await loadRecurringTransactions();
            } catch (error) {
              console.error('Error deleting recurring transaction:', error);
              Alert.alert('Error', 'Failed to delete recurring transaction');
            }
          },
        },
      ]
    );
  };

  const handleGenerateNow = async (recurring: RecurringTransaction) => {
    Alert.alert(
      'Generate Transaction',
      `Generate a transaction for "${recurring.description}" now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              await recurringTransactionService.generateTransactionFromRecurring(recurring);
              await loadRecurringTransactions();
              Alert.alert('Success', 'Transaction generated successfully!');
            } catch (error) {
              console.error('Error generating transaction:', error);
              Alert.alert('Error', 'Failed to generate transaction');
            }
          },
        },
      ]
    );
  };

  const renderRecurringTransaction = ({ item }: { item: RecurringTransaction }) => {
    const frequencyText = recurringTransactionService.getFrequencyDescription(
      item.frequency,
      item.intervalCount
    );

    return (
      <View style={[styles.card, !item.isActive && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={[styles.description, !item.isActive && styles.textInactive]}>
              {item.description}
            </Text>
            <Text style={[styles.category, !item.isActive && styles.textInactive]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <Text
              style={[
                styles.amount,
                { color: item.type === 'INCOME' ? '#34C759' : '#FF3B30' },
                !item.isActive && styles.textInactive,
              ]}
            >
              {item.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons 
              name="repeat" 
              size={14} 
              color={item.isActive ? '#6b7280' : '#9ca3af'} 
            />
            <Text style={[styles.detailText, !item.isActive && styles.textInactive]}>
              {frequencyText}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons 
              name="calendar-outline" 
              size={14} 
              color={item.isActive ? '#6b7280' : '#9ca3af'} 
            />
            <Text style={[styles.detailText, !item.isActive && styles.textInactive]}>
              Next: {formatDate(item.nextDate)}
            </Text>
          </View>

          {item.endDate && (
            <View style={styles.detailRow}>
              <Ionicons 
                name="flag-outline" 
                size={14} 
                color={item.isActive ? '#6b7280' : '#9ca3af'} 
              />
              <Text style={[styles.detailText, !item.isActive && styles.textInactive]}>
                Ends: {formatDate(item.endDate)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <View style={styles.toggleContainer}>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggleActive(item)}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor="#ffffff"
            />
            <Text style={[styles.toggleLabel, !item.isActive && styles.textInactive]}>
              {item.isActive ? 'Active' : 'Paused'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {item.isActive && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleGenerateNow(item)}
              >
                <Ionicons name="play-circle-outline" size={20} color="#10b981" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditRecurringTransaction', { recurringTransaction: item })}
            >
              <Ionicons name="create-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="repeat-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No recurring transactions</Text>
      <Text style={styles.emptySubtitle}>
        Tap + to set up automatic bills, subscriptions, or income
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recurring</Text>
        <Text style={styles.headerSubtitle}>
          {recurringTransactions.filter(r => r.isActive).length} active
        </Text>
      </View>

      <FlatList
        data={recurringTransactions}
        renderItem={renderRecurringTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          recurringTransactions.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddRecurringTransaction')}
      >
        <Ionicons name="add" size={32} color="white" />
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
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInactive: {
    color: '#9ca3af',
  },
  cardDetails: {
    gap: 6,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
