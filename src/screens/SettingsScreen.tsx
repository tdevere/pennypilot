import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openAIService } from '../services/openai';
import { dataSharingService } from '../services/dataSharing';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const key = await openAIService.getApiKey();
    if (key) {
      setApiKey(key);
      setIsKeySet(true);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      Alert.alert('Invalid Key', 'OpenAI API keys start with "sk-"');
      return;
    }

    try {
      await openAIService.setApiKey(apiKey.trim());
      setIsKeySet(true);
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const clearApiKey = () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await openAIService.setApiKey('');
            setApiKey('');
            setIsKeySet(false);
            Alert.alert('Cleared', 'API key removed');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
          <Text style={styles.sectionSubtitle}>
            Add your OpenAI API key to enable receipt scanning
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-..."
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowKey(!showKey)}
            >
              <Ionicons
                name={showKey ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveApiKey}
            >
              <Text style={styles.saveButtonText}>Save Key</Text>
            </TouchableOpacity>

            {isKeySet && (
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearApiKey}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {isKeySet && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.statusText}>API key configured</Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Get your API key from{' '}
              <Text style={styles.link}>platform.openai.com/api-keys</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={async () => {
              await dataSharingService.exportAsText();
            }}
          >
            <Ionicons name="share-social" size={24} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: '#fff' }]}>Share as Text (Recommended)</Text>
              <Text style={[styles.actionSubtitle, { color: '#E8F4FF' }]}>Works with WhatsApp, SMS, Email - paste to import</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.importTextSection}>
            <Text style={styles.sectionSubtitle}>Import from Text</Text>
            <TextInput
              style={styles.importTextInput}
              placeholder="Paste the shared code here..."
              value={importText}
              onChangeText={setImportText}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.importTextButton}
              onPress={async () => {
                if (!importText.trim()) {
                  Alert.alert('Error', 'Please paste the shared code first');
                  return;
                }
                
                // Extract base64 data between markers
                const match = importText.match(/--- START DATA ---\n([\s\S]*?)\n--- END DATA ---/);
                const base64Data = match ? match[1] : importText;
                
                const success = await dataSharingService.importFromText(base64Data);
                if (success) {
                  setImportText('');
                }
              }}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.importTextButtonText}>Import Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>Advanced Options</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              await dataSharingService.exportData();
            }}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Export as File</Text>
              <Text style={styles.actionSubtitle}>Save as JSON file for backup</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              await dataSharingService.importData();
            }}
          >
            <Ionicons name="cloud-download-outline" size={24} color="#34C759" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Import from File</Text>
              <Text style={styles.actionSubtitle}>Select JSON file from device</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
            <Text style={styles.infoText}>
              All data stays on your device. Share manually - no cloud storage.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Receipt Scanning</Text>
            <Text style={styles.aboutValue}>{isKeySet ? 'Enabled' : 'Disabled'}</Text>
          </View>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    fontWeight: '500',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#666',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  importTextSection: {
    marginTop: 12,
  },
  importTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  importTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  importTextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
