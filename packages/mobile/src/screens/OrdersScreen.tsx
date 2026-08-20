/**
 * Orders Screen.
 *
 * Displays user's order history with status indicators.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useOrderStore, useAuthStore } from '../stores';
import { formatPrice, formatDate, formatRelativeTime } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { Order } from '@eato/shared/types';

export function OrdersScreen({ navigation }: any) {
  const { orders, isLoading, loadMyOrders } = useOrderStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadMyOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Place your first order from our menu</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.primaryButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
      )}
    />
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig?.bgColor || '#f1f5f9' }]}>
          <Text style={[styles.statusText, { color: statusConfig?.color || '#475569' }]}>
            {statusConfig?.label || order.status}
          </Text>
        </View>
      </View>
      <Text style={styles.orderInfo}>
        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        {order.tableNumber && ` • Table ${order.tableNumber}`}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTime}>{formatRelativeTime(order.createdAt)}</Text>
        <Text style={styles.orderTotal}>{formatPrice(order.totalAmount)}</Text>
      </View>
    </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  primaryButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
