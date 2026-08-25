/**
 * Cart Screen.
 *
 * Displays cart items with quantity controls and checkout.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  const summaryAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(emptyAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [items.length]);

  useEffect(() => {
    Animated.timing(summaryAnim, {
      toValue: items.length > 0 ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [items.length]);

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
        <Animated.View
          style={[
            styles.emptyIconContainer,
            {
              transform: [
                {
                  translateY: emptyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={64} color="#ea580c" />
          </View>
        </Animated.View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven't added any{'\n'}delicious items yet
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Menu')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.browseGradient}
          >
            <Ionicons name="restaurant-outline" size={20} color="#fff" />
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemLeft}>
              <View style={styles.itemAvatar}>
                <Text style={styles.itemEmoji}>🍽️</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.menuItem?.name || 'Menu Item'}
                </Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price)} each</Text>
                {item.specialInstructions && (
                  <Text style={styles.itemInstructions} numberOfLines={1}>
                    "{item.specialInstructions}"
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.itemRight}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#ea580c" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnFilled]}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          </View>
        )}
      />

      {/* Summary Panel */}
      <Animated.View
        style={[
          styles.summaryPanel,
          {
            opacity: summaryAnim,
            transform: [
              {
                translateY: summaryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.summaryInner}>
          {/* Payment Toggle */}
          <View style={styles.paymentToggle}>
            <Text style={styles.paymentLabel}>Payment</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('cash')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={paymentMethod === 'cash' ? '#ea580c' : '#64748b'}
                />
                <Text style={[styles.paymentOptionText, paymentMethod === 'cash' && styles.paymentOptionTextActive]}>
                  Cash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('online')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={paymentMethod === 'online' ? '#ea580c' : '#64748b'}
                />
                <Text style={[styles.paymentOptionText, paymentMethod === 'online' && styles.paymentOptionTextActive]}>
                  Online
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Items ({itemCount})</Text>
              <Text style={styles.priceValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (10%)</Text>
              <Text style={styles.priceValue}>{formatPrice(Math.round(totalAmount * 0.1))}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(Math.round(totalAmount * 1.1))}</Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={isCheckingOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isCheckingOut ? ['#94a3b8', '#cbd5e1'] : ['#ea580c', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutGradient}
            >
              {isCheckingOut ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                  <Text style={styles.checkoutButtonText}>Place Order</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
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
  browseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  browseButtonText: {
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
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  list: {
    padding: 20,
    paddingBottom: 280,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#64748b',
  },
  itemInstructions: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnFilled: {
    backgroundColor: '#ea580c',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 32,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea580c',
    marginTop: 8,
  },
  summaryPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  summaryInner: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  paymentToggle: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  paymentOptionActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  paymentOptionTextActive: {
    color: '#ea580c',
    fontWeight: '600',
  },
  priceBreakdown: {
    marginBottom: 16,
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
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
