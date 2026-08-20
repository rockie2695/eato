/**
 * Cart Screen.
 *
 * Displays cart items with quantity controls and checkout.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useCartStore, useAuthStore, orderApi } from '../stores';
import { formatPrice } from '@eato/shared/utils';
import type { PaymentMethod } from '@eato/shared/types';

export function CartScreen({ navigation }: any) {
  const {
    items,
    totalAmount,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleCheckout() {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your cart first');
      return;
    }

    setIsCheckingOut(true);
    try {
      const order = await orderApi.create({
        paymentMethod,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
      });

      clearCart();
      navigation.navigate('Orders');
      Alert.alert('Order Placed!', `Your order #${order.id.slice(0, 8)} has been placed`);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some delicious items from our menu</Text>
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
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.menuItem?.name || 'Menu Item'}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)} each</Text>
              {item.specialInstructions && (
                <Text style={styles.itemInstructions}>"{item.specialInstructions}"</Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          </View>
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
          <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%)</Text>
          <Text style={styles.summaryValue}>{formatPrice(Math.round(totalAmount * 0.1))}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(Math.round(totalAmount * 1.1))}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentLabel}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={styles.paymentOptionText}>💵 Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('online')}
            >
              <Text style={styles.paymentOptionText}>💳 Online</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={isCheckingOut}
        >
          <Text style={styles.checkoutButtonText}>
            {isCheckingOut ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  itemInstructions: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ea580c',
    marginTop: 8,
  },
  summary: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  paymentSection: {
    marginTop: 16,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  paymentOptionActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkoutButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
