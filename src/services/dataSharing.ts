import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { Alert, Share } from 'react-native';
import { databaseService } from './database';

class DataSharingService {
  // Export all data as shareable text (works in ALL messaging apps!)
  async exportAsText() {
    try {
      const transactions = await databaseService.getAllTransactions();
      const goals = await databaseService.getAllGoals();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        transactions,
        goals,
      };

      // Compress JSON to base64 for easy sharing
      const jsonString = JSON.stringify(exportData);
      const base64Data = btoa(jsonString); // Base64 encode
      
      // Create shareable message
      const message = `📱 PennyPilot Data Export\n\n` +
        `Transactions: ${transactions.length}\n` +
        `Goals: ${goals.length}\n` +
        `Date: ${new Date().toLocaleDateString()}\n\n` +
        `To import: Copy the code below, open PennyPilot → Settings → Import from Text\n\n` +
        `--- START DATA ---\n${base64Data}\n--- END DATA ---`;

      // Use native Share API (works on all apps!)
      const result = await Share.share({
        message,
        title: 'PennyPilot Data Export',
      });

      if (result.action === Share.sharedAction) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Export as text error:', error);
      Alert.alert('Error', 'Failed to export data');
      return false;
    }
  }

  // Import from text/base64
  async importFromText(base64Text: string) {
    try {
      // Clean the text (remove whitespace, newlines)
      const cleanText = base64Text.trim().replace(/\s+/g, '');
      
      // Decode base64
      const jsonString = atob(cleanText);
      const importData = JSON.parse(jsonString);

      // Validate
      if (!importData.version || (!importData.transactions && !importData.goals)) {
        Alert.alert('Error', 'Invalid data format');
        return false;
      }

      let transactionCount = 0;
      let goalCount = 0;

      // Import transactions
      if (importData.transactions?.length) {
        for (const transaction of importData.transactions) {
          const { id, ...transactionData } = transaction;
          await databaseService.addTransaction(transactionData);
          transactionCount++;
        }
      }

      // Import goals
      if (importData.goals?.length) {
        for (const goal of importData.goals) {
          const { id, ...goalData } = goal;
          await databaseService.addGoal(goalData);
          goalCount++;
        }
      }

      Alert.alert(
        'Success! 🎉',
        `Imported:\n• ${transactionCount} transactions\n• ${goalCount} goals`
      );
      
      return true;
    } catch (error) {
      console.error('Import from text error:', error);
      Alert.alert('Error', 'Failed to import data. Please check the code is complete and correct.');
      return false;
    }
  }

  // Export all data to JSON file (original method - still useful for backups)
  async exportData() {
    try {
      // Get all transactions and goals
      const transactions = await databaseService.getAllTransactions();
      const goals = await databaseService.getAllGoals();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        transactions,
        goals,
      };

      // Create JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create file with recognizable name
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `pennypilot-backup-${dateStr}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Check if sharing is available
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Share PennyPilot Data',
          UTI: 'public.json',
        });
        
        return true;
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
        return false;
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
      return false;
    }
  }

  // Import data from JSON file
  async importData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return false;
      }

      const fileUri = result.assets[0].uri;
      
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);

      // Validate data structure
      if (!importData.version || !importData.transactions || !importData.goals) {
        Alert.alert('Error', 'Invalid data file format');
        return false;
      }

      // Ask for confirmation
      return new Promise((resolve) => {
        Alert.alert(
          'Import Data',
          `This will import:\n• ${importData.transactions.length} transactions\n• ${importData.goals.length} goals\n\nExisting data will be kept.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Import',
              onPress: async () => {
                try {
                  // Import transactions
                  for (const transaction of importData.transactions) {
                    // Skip the id, let database assign new ones
                    const { id, ...transactionData } = transaction;
                    await databaseService.addTransaction(transactionData);
                  }

                  // Import goals
                  for (const goal of importData.goals) {
                    const { id, ...goalData } = goal;
                    await databaseService.addGoal(goalData);
                  }

                  Alert.alert('Success', 'Data imported successfully!');
                  resolve(true);
                } catch (error) {
                  console.error('Import error:', error);
                  Alert.alert('Error', 'Failed to import data');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import data');
      return false;
    }
  }

  // Export only transactions
  async exportTransactions(startDate?: string, endDate?: string) {
    try {
      let transactions;
      
      if (startDate && endDate) {
        transactions = await databaseService.getTransactionsByDateRange(startDate, endDate);
      } else {
        transactions = await databaseService.getAllTransactions();
      }

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        type: 'transactions',
        transactions,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `pennypilot-transactions-${dateStr}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Share Transactions',
          UTI: 'public.json',
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Export transactions error:', error);
      Alert.alert('Error', 'Failed to export transactions');
      return false;
    }
  }
}

export const dataSharingService = new DataSharingService();
