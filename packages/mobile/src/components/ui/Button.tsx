import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style, textStyle }: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'gradient' ? '#fff' : '#ea580c'} size="small" />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  primary: { backgroundColor: '#ea580c' },
  secondary: { backgroundColor: '#1e293b' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#e2e8f0' },
  ghost: { backgroundColor: 'transparent' },
  gradient: { backgroundColor: '#ea580c', shadowColor: '#ea580c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: 8, paddingHorizontal: 16 },
  size_md: { paddingVertical: 12, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32 },
  text: { fontWeight: '600' },
  text_primary: { color: '#fff' },
  text_secondary: { color: '#fff' },
  text_outline: { color: '#1e293b' },
  text_ghost: { color: '#ea580c' },
  text_gradient: { color: '#fff' },
  textDisabled: { opacity: 0.7 },
  textSize_sm: { fontSize: 14 },
  textSize_md: { fontSize: 16 },
  textSize_lg: { fontSize: 18 },
});
