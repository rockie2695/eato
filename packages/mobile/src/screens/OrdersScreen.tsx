/**
 * Orders Screen.
 *
 * Displays user's order history with status indicators.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore, useAuthStore } from '../stores';
import { formatPrice, formatRelativeTime } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { Order } from '@eato/shared/types';

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  served: 'success',
  completed: 'success',
  cancelled: 'error',
};

export function OrdersScreen({ navigation }: any) {
  const { orders, isLoading, loadMyOrders } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const animatedCards = useRef<Map<string, Animated.Value>>(new Map()).current;

  useEffect(() => {
    if (isAuthenticated) {
      loadMyOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    orders.forEach((order, index) => {
      let anim = animatedCards.get(order.id);
      if (!anim) {
        anim = new Animated.Value(0);
        animatedCards.set(order.id, anim);
      }
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="lock-closed-outline" size={48} color="#ea580c" />
        </View>
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <Text style={styles.emptySubtitle}>
          Track your orders and order history{'\n'}by signing in
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.authGradient}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Sign In</Text>
          </LinearGradient>
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
        <View style={styles.emptyIconBg}>
          <Ionicons name="receipt-outline" size={48} color="#ea580c" />
        </View>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Place your first order and it will{'\n'}appear here
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Menu')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.authGradient}
          >
            <Ionicons name="restaurant-outline" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Browse Menu</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.orderCount}>
          <Text style={styles.orderCountText}>{orders.length}</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadMyOrders}
            tintColor="#ea580c"
          />
        }
        renderItem={({ item }) => {
          const anim = animatedCards.get(item.id);
          const statusConfig = ORDER_STATUS_CONFIG[item.status];
          const variant = STATUS_VARIANTS[item.status] || 'default';

          return (
            <Animated.View
              style={[
                anim && {
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                activeOpacity={0.7}
              >
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderIdContainer}>
                    <View style={styles.orderIdIcon}>
                      <Ionicons name="receipt-outline" size={16} color="#ea580c" />
                    </View>
                    <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(variant) }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(variant) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(variant) }]}>
                      {statusConfig?.label || item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderCardBody}>
                  <View style={styles.orderMeta}>
                    <Ionicons name="basket-outline" size={16} color="#64748b" />
                    <Text style={styles.orderMetaText}>
                      {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                    </Text>
                    {item.tableNumber && (
                      <>
                        <View style={styles.metaDivider} />
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={styles.orderMetaText}>Table {item.tableNumber}</Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.orderCardFooter}>
                  <Text style={styles.orderTime}>{formatRelativeTime(item.createdAt)}</Text>
                  <Text style={styles.orderTotal}>{formatPrice(item.totalAmount)}</Text>
                </View>

                <View style={styles.orderCardArrow}>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

function getStatusBg(variant: string): string {
  const map: Record<string, string> = {
    success: '#dcfce7',
    warning: '#fef3c7',
    error: '#fef2f2',
    info: '#dbeafe',
    default: '#f1f5f9',
  };
  return map[variant] || '#f1f5f9';
}

function getStatusColor(variant: string): string {
  const map: Record<string, string> = {
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#3b82f6',
    default: '#475569',
  };
  return map[variant] || '#475569';
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
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  orderCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  list: {
    padding: 20,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardBody: {
    marginBottom: 12,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderMetaText: {
    fontSize: 13,
    color: '#64748b',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  orderTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ea580c',
  },
  orderCardArrow: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -9,
  },
});
