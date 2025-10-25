import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, RecurringFrequency } from '../types';
import { databaseService } from '../services/database';
import { recurringTransactionService } from '../services/recurringTransactionService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddRouteType = RouteProp<RootStackParamList, 'AddRecurringTransaction'>;
type EditRouteType = RouteProp<RootStackParamList, 'EditRecurringTransaction'>;

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

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export default function AddRecurringTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddRouteType | EditRouteType>();
  
  // Check if we're editing
  const isEditing = 'recurringTransaction' in (route.params || {});
  const existingRecurring = isEditing ? (route.params as any).recurringTransaction : null;

  const [amount, setAmount] = useState(existingRecurring?.amount.toString() || '');
  const [description, setDescription] = useState(existingRecurring?.description || '');
  const [category, setCategory] = useState(existingRecurring?.category || 'Bills');
  const [merchant, setMerchant] = useState(existingRecurring?.merchant || '');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(existingRecurring?.type || 'EXPENSE');
  const [frequency, setFrequency] = useState<RecurringFrequency>(existingRecurring?.frequency || 'MONTHLY');
  const [intervalCount, setIntervalCount] = useState(existingRecurring?.intervalCount?.toString() || '1');
  const [nextDate, setNextDate] = useState(
    existingRecurring?.nextDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(existingRecurring?.endDate || '');
  const [hasEndDate, setHasEndDate] = useState(!!existingRecurring?.endDate);

  const handleSubmit = async () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const intervalNum = parseInt(intervalCount);
    if (isNaN(intervalNum) || intervalNum <= 0) {
      Alert.alert('Error', 'Please enter a valid interval (minimum 1)');
      return;
    }

    if (hasEndDate && endDate && endDate <= nextDate) {
      Alert.alert('Error', 'End date must be after the start date');
      return;
    }

    try {
      const now = new Date().toISOString();
      const recurringData = {
        amount: amountNum,
        description,
        category,
        type,
        merchant: merchant || undefined,
        frequency,
        intervalCount: intervalNum,
        nextDate,
        endDate: hasEndDate && endDate ? endDate : undefined,
        isActive: true,
        lastGeneratedDate: existingRecurring?.lastGeneratedDate,
        createdAt: existingRecurring?.createdAt || now,
        updatedAt: now,
      };

      if (isEditing && existingRecurring) {
        await databaseService.updateRecurringTransaction(existingRecurring.id, recurringData);
        Alert.alert('Success', 'Recurring transaction updated!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await databaseService.addRecurringTransaction(recurringData);
        Alert.alert('Success', 'Recurring transaction added!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      Alert.alert('Error', 'Failed to save recurring transaction');
    }
  };

  const getFrequencyDescription = () => {
    return recurringTransactionService.getFrequencyDescription(frequency, parseInt(intervalCount) || 1);
  };

  const getNextOccurrencesPreview = () => {
    const interval = parseInt(intervalCount) || 1;
    return recurringTransactionService.getNextOccurrences(nextDate, frequency, interval, 3);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Recurring' : 'New Recurring'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.form}>
        {/* Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'EXPENSE' && styles.typeButtonActive,
              ]}
              onPress={() => setType('EXPENSE')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'EXPENSE' && styles.typeButtonTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'INCOME' && styles.typeButtonActive,
              ]}
              onPress={() => setType('INCOME')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'INCOME' && styles.typeButtonTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Netflix Subscription"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Merchant */}
        <View style={styles.section}>
          <Text style={styles.label}>Merchant (Optional)</Text>
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Netflix, Spotify, etc."
          />
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyChip,
                  frequency === freq.value && styles.frequencyChipActive,
                ]}
                onPress={() => setFrequency(freq.value)}
              >
                <Text
                  style={[
                    styles.frequencyChipText,
                    frequency === freq.value && styles.frequencyChipTextActive,
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interval */}
        <View style={styles.section}>
          <Text style={styles.label}>Repeat Every</Text>
          <View style={styles.intervalContainer}>
            <TextInput
              style={[styles.input, styles.intervalInput]}
              value={intervalCount}
              onChangeText={setIntervalCount}
              placeholder="1"
              keyboardType="number-pad"
            />
            <Text style={styles.intervalText}>{getFrequencyDescription()}</Text>
          </View>
        </View>

        {/* Next Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={nextDate}
            onChangeText={setNextDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* End Date Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasEndDate(!hasEndDate)}
          >
            <Ionicons
              name={hasEndDate ? 'checkbox' : 'square-outline'}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.checkboxLabel}>Set end date</Text>
          </TouchableOpacity>
        </View>

        {hasEndDate && (
          <View style={styles.section}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        )}

        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Next 3 Occurrences</Text>
          {getNextOccurrencesPreview().map((date, index) => (
            <Text key={index} style={styles.previewDate}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Recurring Transaction' : 'Add Recurring Transaction'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  frequencyChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  frequencyChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  frequencyChipTextActive: {
    color: 'white',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intervalInput: {
    width: 80,
  },
  intervalText: {
    fontSize: 16,
    color: '#6b7280',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  previewSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
