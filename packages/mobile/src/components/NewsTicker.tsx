/**
 * Mobile News Ticker Component.
 *
 * Displays a horizontally scrolling announcement banner.
 * Auto-rotates through multiple tickers.
 *
 * @example
 * <NewsTicker tickers={notifications} />
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import type { Notification } from '@eato/shared/types';

interface NewsTickerProps {
  tickers: Notification[];
  onDismiss?: () => void;
}

export function NewsTicker({ tickers, onDismiss }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const activeTickers = tickers.filter((t) => t.isActive);

  // Auto-rotate through tickers
  useEffect(() => {
    if (activeTickers.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % activeTickers.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTickers.length, fadeAnim]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || activeTickers.length === 0) return null;

  const current = activeTickers[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📢</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {current.message}
          </Text>
        </View>
      </Animated.View>

      <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>

      {/* Progress dots */}
      {activeTickers.length > 1 && (
        <View style={styles.dots}>
          {activeTickers.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  message: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  dismissButton: {
    padding: 6,
  },
  dismissText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#f97316',
    opacity: 0.3,
  },
  activeDot: {
    width: 16,
    opacity: 1,
  },
});
