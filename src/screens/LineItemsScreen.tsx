import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { databaseService } from '../services/database';
import { LineItem, Transaction } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LineItems'>;
  route: RouteProp<RootStackParamList, 'LineItems'>;
};

export default function LineItemsScreen({ navigation, route }: Props) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    unitPrice: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const trans = await databaseService.getTransactionById(transactionId);
      const items = await databaseService.getLineItemsByTransaction(transactionId);
      setTransaction(trans);
      setLineItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load line items');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', quantity: '1', unitPrice: '0' });
    setIsModalVisible(true);
  };

  const openEditModal = (item: LineItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    const quantity = parseFloat(formData.quantity) || 1;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const totalPrice = quantity * unitPrice;

    try {
      if (editingItem && editingItem.id) {
        await databaseService.updateLineItem(editingItem.id, {
          transactionId,
          name: formData.name.trim(),
          quantity,
          unitPrice,
          totalPrice,
        });
      } else {
        await databaseService.addLineItem({
          transactionId,
          name: formData.name.trim(),
          quantity,
          unitPrice,
          totalPrice,
        });
      }
      
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving line item:', error);
      Alert.alert('Error', 'Failed to save line item');
    }
  };

  const handleDelete = (item: LineItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.id) {
                await databaseService.deleteLineItem(item.id);
                loadData();
              }
            } catch (error) {
              console.error('Error deleting line item:', error);
              Alert.alert('Error', 'Failed to delete line item');
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const renderItem = ({ item }: { item: LineItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>
          {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.totalPrice.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {transaction && (
        <View style={styles.header}>
          <Text style={styles.merchantName}>{transaction.merchant || transaction.description}</Text>
          <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Line Items Total</Text>
        <Text style={styles.summaryAmount}>${calculateTotal().toFixed(2)}</Text>
        {lineItems.length > 0 && Math.abs(calculateTotal() - (transaction?.amount || 0)) > 0.01 && (
          <Text style={styles.warningText}>
            ⚠️ Total doesn't match transaction amount
          </Text>
        )}
      </View>

      <FlatList
        data={lineItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No line items yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add items</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Item' : 'Add Item'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="decimal-pad"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Unit price"
              keyboardType="decimal-pad"
              value={formData.unitPrice}
              onChangeText={(text) => setFormData({ ...formData, unitPrice: text })}
            />

            <View style={styles.totalPreview}>
              <Text style={styles.totalPreviewText}>
                Total: ${(parseFloat(formData.quantity || '0') * parseFloat(formData.unitPrice || '0')).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  itemCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  totalPreview: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
