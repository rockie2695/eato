/**
 * Order Detail Screen.
 *
 * Shows detailed order information with status tracking.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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

  useEffect(() => {
    getOrder(orderId);
  }, [orderId]);

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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig?.bgColor || '#f1f5f9' }]}>
          <Text style={[styles.statusText, { color: statusConfig?.color || '#475569' }]}>
            {statusConfig?.label || order.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{formatDate(order.createdAt)}</Text>

      {/* Status Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.cardTitle}>Order Progress</Text>
        <View style={styles.timeline}>
          {STATUS_TIMELINE.map((status, index) => {
            const config = ORDER_STATUS_CONFIG[status];
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <View key={status} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    isCompleted && styles.timelineDotCompleted,
                    isCurrent && styles.timelineDotCurrent,
                  ]}
                >
                  <Text style={styles.timelineDotText}>
                    {isCompleted ? '✓' : index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    isCompleted && styles.timelineLabelCompleted,
                  ]}
                >
                  {config?.label || status}
                </Text>
                {index < STATUS_TIMELINE.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName}>{item.menuItem?.name || 'Menu Item'}</Text>
              <Text style={styles.orderItemQty}>
                Qty: {item.quantity} × {formatPrice(item.price)}
              </Text>
            </View>
            <Text style={styles.orderItemTotal}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%)</Text>
          <Text style={styles.summaryValue}>{formatPrice(Math.round(order.totalAmount * 0.1))}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(Math.round(order.totalAmount * 1.1))}</Text>
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>{order.paymentMethod}</Text>
        </View>
        {order.tableNumber && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Table</Text>
            <Text style={styles.infoValue}>{order.tableNumber}</Text>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timelineCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineDotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#94a3b8',
    flex: 1,
  },
  timelineLabelCompleted: {
    color: '#1e293b',
    fontWeight: '500',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  timelineLineCompleted: {
    backgroundColor: '#ea580c',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
    marginTop: 0,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
