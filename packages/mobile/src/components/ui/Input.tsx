import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type ViewStyle } from 'react-native';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Input({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, error, icon, style }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, focused && styles.inputFocused, error && styles.inputError]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: '#ea580c', shadowColor: '#ea580c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  inputError: { borderColor: '#dc2626' },
  icon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1e293b' },
  inputWithIcon: { paddingLeft: 0 },
  error: { fontSize: 13, color: '#dc2626', marginTop: 6 },
});
