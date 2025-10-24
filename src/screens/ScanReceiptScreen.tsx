import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { openAIService, ReceiptData } from '../services/openai';
import { databaseService } from '../services/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScanReceiptScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      
      setImageUri(uri);
      setBase64Image(base64 || null);
      
      if (base64) {
        // Analyze receipt
        await analyzeReceipt(base64);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      
      setImageUri(uri);
      setBase64Image(base64 || null);
      
      if (base64) {
        // Analyze receipt
        await analyzeReceipt(base64);
      }
    }
  };

  const analyzeReceipt = async (base64ImageData: string) => {
    setIsAnalyzing(true);
    setLastError(null);
    
    try {
      const hasKey = await openAIService.hasApiKey();
      
      if (!hasKey) {
        Alert.alert(
          'API Key Required',
          'Please set your OpenAI API key in Settings first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Settings',
              onPress: () => navigation.goBack()
            }
          ]
        );
        setIsAnalyzing(false);
        return;
      }

      console.log('Starting receipt analysis...');
      const data = await openAIService.analyzeReceipt(base64ImageData);
      console.log('Receipt analysis completed:', data);
      
      setReceiptData(data);
      setLastError(null);
      
      if (data.confidence < 0.5) {
        Alert.alert(
          'Low Confidence',
          'The receipt image quality is low. Please verify the extracted data or try again with a clearer photo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze receipt';
      console.error('Analysis error:', errorMessage);
      setLastError(errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage + '\n\nThe photo has been saved. You can retry the analysis.',
        [
          { text: 'OK' }
        ]
      );
      setReceiptData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retryAnalysis = async () => {
    if (!base64Image) {
      Alert.alert('Error', 'No image to analyze');
      return;
    }
    await analyzeReceipt(base64Image);
  };

  const saveTransaction = async () => {
    if (!receiptData) return;

    try {
      const now = new Date().toISOString();
      const transactionId = await databaseService.addTransaction({
        amount: receiptData.amount,
        description: receiptData.merchant,
        category: receiptData.category,
        date: receiptData.date,
        type: 'EXPENSE',
        merchant: receiptData.merchant,
        excludeFromReports: false,
        createdAt: now,
        updatedAt: now,
      });

      // Save line items if available
      if (receiptData.items && Array.isArray(receiptData.items) && receiptData.items.length > 0) {
        for (const item of receiptData.items) {
          if (typeof item === 'object' && item.name) {
            await databaseService.addLineItem({
              transactionId,
              name: item.name,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || item.totalPrice || 0,
              totalPrice: item.totalPrice || item.unitPrice || 0,
            });
          }
        }
      }

      const itemCount = receiptData.items?.length || 0;
      Alert.alert(
        'Success', 
        `Transaction saved!\n\nMerchant: ${receiptData.merchant}\nAmount: $${receiptData.amount.toFixed(2)}\nLine items: ${itemCount}`,
        [
          {
            text: 'View Line Items',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('LineItems', { transactionId });
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Receipt',
      'Choose how to add your receipt',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!imageUri ? (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Scan a Receipt</Text>
            <Text style={styles.emptySubtitle}>
              Take a photo or choose from your library
            </Text>
            <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions}>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Add Receipt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {isAnalyzing && (
              <View style={styles.analyzeOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.analyzingText}>Analyzing receipt...</Text>
              </View>
            )}

            {receiptData && !isAnalyzing && (
              <View style={styles.resultsCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Extracted Data</Text>
                  <View style={[
                    styles.confidenceBadge,
                    receiptData.confidence > 0.7 ? styles.highConfidence : styles.lowConfidence
                  ]}>
                    <Text style={styles.confidenceText}>
                      {Math.round(receiptData.confidence * 100)}% confident
                    </Text>
                  </View>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Merchant:</Text>
                  <Text style={styles.resultValue}>{receiptData.merchant}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Amount:</Text>
                  <Text style={styles.resultValue}>${receiptData.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Category:</Text>
                  <Text style={styles.resultValue}>{receiptData.category}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Date:</Text>
                  <Text style={styles.resultValue}>{receiptData.date}</Text>
                </View>

                {receiptData.items && receiptData.items.length > 0 && (
                  <View style={styles.itemsList}>
                    <Text style={styles.resultLabel}>Items ({receiptData.items.length}):</Text>
                    {receiptData.items.map((item, index) => (
                      <Text key={index} style={styles.itemText}>
                        • {typeof item === 'string' ? item : `${item.name} (${item.quantity} × $${item.unitPrice.toFixed(2)})`}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.retryButton]}
                    onPress={showImageOptions}
                  >
                    <Text style={styles.buttonText}>New Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={saveTransaction}
                  >
                    <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!receiptData && !isAnalyzing && lastError && (
              <View style={styles.errorCard}>
                <Ionicons name="warning-outline" size={48} color="#FF3B30" />
                <Text style={styles.errorTitle}>Analysis Failed</Text>
                <Text style={styles.errorMessage}>{lastError}</Text>
                
                <Text style={styles.savedInfo}>
                  💡 Tip: The image is cached, you can retry analysis
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.retryButton]}
                    onPress={retryAnalysis}
                  >
                    <Ionicons name="refresh" size={20} color="#007AFF" />
                    <Text style={styles.buttonText}>Retry Analysis</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.newPhotoButton]}
                    onPress={showImageOptions}
                  >
                    <Text style={styles.buttonText}>New Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  analyzeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highConfidence: {
    backgroundColor: '#34C759',
  },
  lowConfidence: {
    backgroundColor: '#FF9500',
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  itemsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  retryButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  newPhotoButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveButtonText: {
    color: 'white',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  savedInfo: {
    fontSize: 13,
    color: '#34C759',
    marginTop: 12,
    fontWeight: '500',
  },
});
