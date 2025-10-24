import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import Navigation from './src/navigation';
import { databaseService } from './src/services/database';
import { openAIService } from './src/services/openai';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await databaseService.init();
        await openAIService.init();
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }

    prepare();
  }, []);

  // Handle incoming file links (when user taps .json file)
  useEffect(() => {
    const handleIncomingUrl = async (event: { url: string }) => {
      try {
        const url = event.url;
        console.log('Incoming file URL:', url);

        // Check if it's a file URL (JSON file)
        if (url.startsWith('file://') || url.startsWith('content://')) {
          // Ask user if they want to import
          Alert.alert(
            'Import Data',
            'Would you like to import this PennyPilot data file?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Import',
                onPress: async () => {
                  try {
                    console.log('Reading file:', url);
                    // Read the file
                    const fileContent = await FileSystem.readAsStringAsync(url);
                    const importData = JSON.parse(fileContent);

                    // Validate data format
                    if (!importData.version || (!importData.transactions && !importData.goals)) {
                      Alert.alert('Error', 'Invalid PennyPilot data file format');
                      return;
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
                  } catch (error) {
                    console.error('Import error:', error);
                    Alert.alert('Error', 'Failed to import data file. Please check the file format.');
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error handling incoming URL:', error);
      }
    };

    // Listen for incoming URLs (when app is already open)
    const subscription = Linking.addEventListener('url', handleIncomingUrl);

    // Check if app was opened with a URL (when app was closed)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleIncomingUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
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
