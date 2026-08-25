import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const variantColors = {
  default: { bg: '#f1f5f9', text: '#475569' },
  success: { bg: '#dcfce7', text: '#16a34a' },
  warning: { bg: '#fef3c7', text: '#f59e0b' },
  error: { bg: '#fef2f2', text: '#dc2626' },
  info: { bg: '#dbeafe', text: '#3b82f6' },
};

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.base, { backgroundColor: colors.bg }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color: colors.text }, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
  textSm: { fontSize: 11 },
});
