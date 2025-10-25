import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Income',
  'Other',
];

const SORT_OPTIONS = [
  { label: 'Date (Newest)', value: 'date', order: 'DESC' },
  { label: 'Date (Oldest)', value: 'date', order: 'ASC' },
  { label: 'Amount (Highest)', value: 'amount', order: 'DESC' },
  { label: 'Amount (Lowest)', value: 'amount', order: 'ASC' },
  { label: 'Category (A-Z)', value: 'category', order: 'ASC' },
  { label: 'Category (Z-A)', value: 'category', order: 'DESC' },
];

export interface FilterOptions {
  categories: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  types: ('INCOME' | 'EXPENSE')[];
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'ASC' | 'DESC';
}

interface FilterDrawerProps {
  visible: boolean;
  filters: FilterOptions;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onClear: () => void;
}

export default function FilterDrawer({
  visible,
  filters,
  onClose,
  onApply,
  onClear,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleCategory = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const toggleType = (type: 'INCOME' | 'EXPENSE') => {
    const newTypes = localFilters.types.includes(type)
      ? localFilters.types.filter(t => t !== type)
      : [...localFilters.types, type];
    
    setLocalFilters({ ...localFilters, types: newTypes });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      types: [],
      sortBy: 'date',
      sortOrder: 'DESC',
    };
    setLocalFilters(defaultFilters);
    onClear();
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.startDate || localFilters.endDate) count++;
    if (localFilters.minAmount !== undefined || localFilters.maxAmount !== undefined) count++;
    if (localFilters.types.length > 0 && localFilters.types.length < 2) count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Filters</Text>
              {getActiveFilterCount() > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    localFilters.types.includes('EXPENSE') && styles.chipSelected,
                  ]}
                  onPress={() => toggleType('EXPENSE')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.types.includes('EXPENSE') && styles.chipTextSelected,
                    ]}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    localFilters.types.includes('INCOME') && styles.chipSelected,
                  ]}
                  onPress={() => toggleType('INCOME')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.types.includes('INCOME') && styles.chipTextSelected,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.chipContainer}>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      localFilters.categories.includes(category) && styles.chipSelected,
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.categories.includes(category) && styles.chipTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {SORT_OPTIONS.map(option => {
                const isSelected =
                  localFilters.sortBy === option.value &&
                  localFilters.sortOrder === option.order;
                
                return (
                  <TouchableOpacity
                    key={`${option.value}-${option.order}`}
                    style={styles.sortOption}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        sortBy: option.value as any,
                        sortOrder: option.order as any,
                      })
                    }
                  >
                    <Text style={styles.sortOptionText}>{option.label}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Range - Placeholder for future implementation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <Text style={styles.comingSoonText}>
                Date pickers coming soon...
              </Text>
            </View>

            {/* Amount Range - Placeholder for future implementation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount Range</Text>
              <Text style={styles.comingSoonText}>
                Amount sliders coming soon...
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    backgroundColor: '#10b981',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
