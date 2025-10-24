import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { databaseService } from '../services/database';
import { Transaction, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'pie' | 'bar' | 'list';

interface SpendingSummary {
  total: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
  categoryBreakdown: { [category: string]: number };
}

const screenWidth = Dimensions.get('window').width;

// Category colors for pie chart
const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
];

export default function ReportsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [period, setPeriod] = useState<Period>('monthly');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [summary, setSummary] = useState<SpendingSummary>({
    total: 0,
    income: 0,
    expenses: 0,
    transactions: [],
    categoryBreakdown: {},
  });

  const loadData = async () => {
    const { startDate, endDate } = getDateRange(period);
    const allTransactions = await databaseService.getTransactionsByDateRange(
      startDate,
      endDate
    );

    // Filter out transactions excluded from reports
    const transactions = allTransactions.filter((t) => !t.excludeFromReports);

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: { [category: string]: number } = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    setSummary({
      total: income - expenses,
      income,
      expenses,
      transactions,
      categoryBreakdown,
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [period])
  );

  const getDateRange = (period: Period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryPercentage = (amount: number) => {
    if (summary.expenses === 0) return 0;
    return (amount / summary.expenses) * 100;
  };

  const getCategoryPercentageString = (amount: number) => {
    return getCategoryPercentage(amount).toFixed(1);
  };

  const sortedCategories = Object.entries(summary.categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  // Get filtered transactions based on selected category
  const filteredTransactions = selectedCategory
    ? summary.transactions.filter(
        (t) => t.category === selectedCategory && t.type === 'EXPENSE'
      )
    : summary.transactions.filter((t) => t.type === 'EXPENSE');

  // Prepare pie chart data
  const pieChartData = sortedCategories.map(([category, amount], index) => ({
    name: category,
    amount: amount,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Prepare bar chart data
  const barChartData = {
    labels: sortedCategories.slice(0, 5).map(([cat]) => cat.substring(0, 8)),
    datasets: [
      {
        data: sortedCategories.slice(0, 5).map(([, amount]) => amount),
      },
    ],
  };

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
    >
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.transactionAmount}>{formatCurrency(item.amount)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodSelector}
        contentContainerStyle={styles.periodContent}
      >
        {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.totalCard]}>
          <Text style={styles.summaryLabel}>Net Balance</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summary.total >= 0 ? '#34C759' : '#FF3B30' },
            ]}
          >
            {summary.total >= 0 ? '+' : ''}
            {formatCurrency(summary.total)}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Ionicons name="arrow-down-circle" size={24} color="#34C759" />
            <Text style={styles.smallLabel}>Income</Text>
            <Text style={styles.smallValue}>{formatCurrency(summary.income)}</Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Ionicons name="arrow-up-circle" size={24} color="#FF3B30" />
            <Text style={styles.smallLabel}>Expenses</Text>
            <Text style={styles.smallValue}>{formatCurrency(summary.expenses)}</Text>
          </View>
        </View>
      </View>

      {/* Chart Type Toggle */}
      {sortedCategories.length > 0 && (
        <>
          <View style={styles.chartToggle}>
            <TouchableOpacity
              style={[styles.chartButton, chartType === 'pie' && styles.chartButtonActive]}
              onPress={() => setChartType('pie')}
            >
              <Ionicons name="pie-chart" size={20} color={chartType === 'pie' ? '#fff' : '#666'} />
              <Text style={[styles.chartButtonText, chartType === 'pie' && styles.chartButtonTextActive]}>
                Pie Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartButton, chartType === 'bar' && styles.chartButtonActive]}
              onPress={() => setChartType('bar')}
            >
              <Ionicons name="bar-chart" size={20} color={chartType === 'bar' ? '#fff' : '#666'} />
              <Text style={[styles.chartButtonText, chartType === 'bar' && styles.chartButtonTextActive]}>
                Bar Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartButton, chartType === 'list' && styles.chartButtonActive]}
              onPress={() => setChartType('list')}
            >
              <Ionicons name="list" size={20} color={chartType === 'list' ? '#fff' : '#666'} />
              <Text style={[styles.chartButtonText, chartType === 'list' && styles.chartButtonTextActive]}>
                List
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pie Chart View */}
          {chartType === 'pie' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Spending Distribution</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </ScrollView>
            </View>
          )}

          {/* Bar Chart View */}
          {chartType === 'bar' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Top 5 Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={barChartData}
                  width={Math.max(screenWidth - 32, sortedCategories.length * 60)}
                  height={220}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  fromZero
                />
              </ScrollView>
            </View>
          )}

          {/* Category Breakdown List */}
          {chartType === 'list' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              
              {sortedCategories.map(([category, amount], index) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryRow,
                    selectedCategory === category && styles.categoryRowSelected,
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View
                    style={[
                      styles.categoryColorDot,
                      { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] },
                    ]}
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                  </View>
                  
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { 
                          width: `${getCategoryPercentage(amount)}%`,
                          backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        },
                      ]}
                    />
                  </View>
                  
                  <View style={styles.categoryRightInfo}>
                    <Text style={styles.categoryPercent}>
                      {getCategoryPercentageString(amount)}%
                    </Text>
                    <Ionicons 
                      name={selectedCategory === category ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Category Transactions */}
          {selectedCategory && (
            <View style={styles.transactionsSection}>
              <View style={styles.transactionsSectionHeader}>
                <Text style={styles.transactionsSectionTitle}>
                  {selectedCategory} Transactions ({filteredTransactions.length})
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyTransactions}>No transactions found</Text>
                }
              />
            </View>
          )}
        </>
      )}

      {/* Transaction Count */}
      <View style={styles.statsCard}>
        <Ionicons name="receipt-outline" size={24} color="#007AFF" />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{summary.transactions.length}</Text>
          <Text style={styles.statsLabel}>Total Transactions</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setSelectedCategory(selectedCategory ? null : 'All')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* All Transactions View */}
      {selectedCategory === 'All' && (
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsSectionHeader}>
            <Text style={styles.transactionsSectionTitle}>
              All Transactions ({summary.transactions.length})
            </Text>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={summary.transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {summary.transactions.length === 0 && !selectedCategory && (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Data</Text>
          <Text style={styles.emptySubtitle}>
            No transactions in this period
          </Text>
        </View>
      )}
    </ScrollView>
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
  periodSelector: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  incomeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  expenseCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
  },
  smallValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  chartButtonActive: {
    backgroundColor: '#007AFF',
  },
  chartButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  chartButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  categoryRow: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  categoryRowSelected: {
    backgroundColor: '#E8F4FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  categoryPercent: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  categoryRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  transactionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  emptyTransactions: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
});
