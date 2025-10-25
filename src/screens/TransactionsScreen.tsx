import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, RootStackParamList } from '../types';
import { databaseService } from '../services/database';
import SearchBar from '../components/SearchBar';
import FilterDrawer, { FilterOptions } from '../components/FilterDrawer';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    types: [],
    sortBy: 'date',
    sortOrder: 'DESC',
  });

  const loadTransactions = async () => {
    try {
      // Build filter object
      const searchFilters = {
        searchQuery: searchQuery || undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        types: filters.types.length > 0 ? filters.types : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await databaseService.searchAndFilterTransactions(searchFilters);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [searchQuery, filters])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      types: [],
      sortBy: 'date',
      sortOrder: 'DESC',
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++;
    if (filters.types.length > 0 && filters.types.length < 2) count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionCard}
      onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
    >
      <View style={styles.transactionInfo}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          {item.excludeFromReports && (
            <View style={styles.excludedBadge}>
              <Ionicons name="eye-off-outline" size={12} color="#FF9500" />
              <Text style={styles.excludedText}>Excluded</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: item.type === 'INCOME' ? '#34C759' : '#FF3B30' },
          ]}
        >
          {item.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    const hasActiveFilters = getActiveFilterCount() > 0;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={hasActiveFilters ? 'search-outline' : 'wallet-outline'} 
          size={64} 
          color="#ccc" 
        />
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? 'No transactions found' : 'No transactions yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters 
            ? 'Try adjusting your search or filters' 
            : 'Tap + to add your first transaction'}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterDrawerVisible(true)}
          >
            <Ionicons name="filter" size={24} color="#10b981" />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search by merchant or description..."
        />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scanFab}
        onPress={() => navigation.navigate('ScanReceipt')}
      >
        <Ionicons name="camera" size={28} color="white" />
      </TouchableOpacity>

      <FilterDrawer
        visible={filterDrawerVisible}
        filters={filters}
        onClose={() => setFilterDrawerVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
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
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  excludedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  excludedText: {
    fontSize: 10,
    color: '#FF9500',
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
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
  scanFab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
