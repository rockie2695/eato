import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: { label: string; onPress: () => void };
  rightAction?: { label: string; onPress: () => void };
}

export function ScreenHeader({ title, subtitle, leftAction, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.action}>
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.action}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  action: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#ea580c' },
});
