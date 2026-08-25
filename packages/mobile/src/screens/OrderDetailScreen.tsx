/**
 * Order Detail Screen.
 *
 * Shows detailed order information with status tracking.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../stores';
import { formatPrice, formatDate } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { OrderStatus } from '@eato/shared/types';

const STATUS_TIMELINE: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
];

export function OrderDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const { currentOrder, getOrder, isLoading } = useOrderStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timelineAnims = useRef<Animated.Value[]>(STATUS_TIMELINE.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    getOrder(orderId);
  }, [orderId]);

  useEffect(() => {
    if (currentOrder) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const currentStep = STATUS_TIMELINE.indexOf(currentOrder.status);
      const animations = timelineAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        })
      );
      Animated.stagger(80, animations).start();
    }
  }, [currentOrder]);

  if (isLoading || !currentOrder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  const order = currentOrder;
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const currentStep = STATUS_TIMELINE.indexOf(order.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Animated.View style={[styles.headerCard, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#ea580c', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {statusConfig?.label || order.status}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Status Timeline */}
      <Animated.View
        style={[
          styles.timelineCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={20} color="#ea580c" />
          <Text style={styles.cardTitle}>Order Progress</Text>
        </View>
        <View style={styles.timeline}>
          {STATUS_TIMELINE.map((status, index) => {
            const config = ORDER_STATUS_CONFIG[status];
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const anim = timelineAnims[index];

            return (
              <Animated.View
                key={status}
                style={[
                  styles.timelineItem,
                  {
                    opacity: anim,
                    transform: [
                      {
                        translateX: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    ) : (
                      <Text style={styles.timelineDotText}>{index + 1}</Text>
                    )}
                  </View>
                  {index < STATUS_TIMELINE.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}
                  >
                    {config?.label || status}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      {/* Order Items */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="basket-outline" size={20} color="#ea580c" />
          <Text style={styles.cardTitle}>Order Items</Text>
        </View>
        {order.items.map((item, index) => (
          <View key={item.id} style={[styles.orderItem, index === order.items.length - 1 && styles.orderItemLast]}>
            <View style={styles.itemLeft}>
              <View style={styles.itemAvatar}>
                <Text style={styles.itemEmoji}>🍽️</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem?.name || 'Menu Item'}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} × {formatPrice(item.price)}
                </Text>
              </View>
            </View>
            <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (10%)</Text>
            <Text style={styles.priceValue}>{formatPrice(Math.round(order.totalAmount * 0.1))}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(Math.round(order.totalAmount * 1.1))}</Text>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <View style={[styles.infoIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="card-outline" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>{order.paymentMethod}</Text>
        </View>
        {order.tableNumber && (
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="location-outline" size={20} color="#16a34a" />
            </View>
            <Text style={styles.infoLabel}>Table</Text>
            <Text style={styles.infoValue}>#{order.tableNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerGradient: {
    padding: 24,
  },
  headerTop: {
    marginBottom: 16,
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'monospace',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  timelineCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  timeline: {
    gap: 4,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#ea580c',
  },
  timelineDotCurrent: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: '#e2e8f0',
    marginTop: 6,
  },
  timelineLineCompleted: {
    backgroundColor: '#ea580c',
  },
  timelineContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#1e293b',
    fontWeight: '600',
  },
  timelineLabelCurrent: {
    color: '#ea580c',
    fontWeight: '700',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderItemLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#64748b',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  priceBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ea580c',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    margin: 20,
    marginTop: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  bottomSpacer: {
    height: 32,
  },
});
