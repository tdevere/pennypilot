import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import Navigation from './src/navigation';
import { databaseService } from './src/services/database';
import { openAIService } from './src/services/openai';
import { recurringTransactionService } from './src/services/recurringTransactionService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await databaseService.init();
        await openAIService.init();
        
        // Check and generate any due recurring transactions
        await recurringTransactionService.checkAndGenerateTransactions();
        
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
