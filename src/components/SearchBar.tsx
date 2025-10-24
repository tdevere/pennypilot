import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search transactions...',
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  const handleChangeText = (text: string) => {
    setLocalValue(text);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      onChangeText(text);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onClear();

    // Clear pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        returnKeyType="search"
        clearButtonMode="never" // We'll use custom clear button
      />
      {localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    padding: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
