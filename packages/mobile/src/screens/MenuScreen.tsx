/**
 * Menu Screen.
 *
 * Displays menu items with category filtering.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { menuApi } from '../stores';
import { useCartStore } from '../stores';
import type { MenuItemWithCategory, MenuCategory } from '@eato/shared/types';
import { formatPrice } from '@eato/shared/utils';
import { Badge } from '../components/ui/Badge';

export function MenuScreen() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCartStore();
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map()).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  async function loadData() {
    try {
      const [cats, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems({ limit: 50 }),
      ]);
      setCategories(cats);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadItems() {
    try {
      const result = await menuApi.getItems({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50,
      });
      setItems(result.data);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  function getCartQuantity(menuItemId: string): number {
    const cartItem = cartItems.find((i) => i.menuItemId === menuItemId);
    return cartItem?.quantity || 0;
  }

  function animateAdd(itemId: string) {
    let anim = animatedValues.get(itemId);
    if (!anim) {
      anim = new Animated.Value(0);
      animatedValues.set(itemId, anim);
    }
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Menu</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="filter-outline" size={22} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All' } as MenuCategory, ...categories]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.7}
              >
                {isActive && (
                  <LinearGradient
                    colors={['#ea580c', '#f97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Menu Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const qty = getCartQuantity(item.id);
          const anim = animatedValues.get(item.id);

          return (
            <Animated.View
              style={[
                styles.itemCard,
                anim && {
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.itemContent}
                activeOpacity={0.8}
                disabled={!item.isAvailable}
              >
                <LinearGradient
                  colors={['#fff7ed', '#fed7aa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.itemImageContainer}
                >
                  <Text style={styles.itemEmoji}>🍽️</Text>
                </LinearGradient>
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    {!item.isAvailable && (
                      <Badge label="Unavailable" variant="error" size="sm" />
                    )}
                  </View>
                  {item.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    {qty > 0 ? (
                      <View style={styles.quantityBadge}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => {
                            useCartStore.getState().updateQuantity(
                              cartItems.find((i) => i.menuItemId === item.id)?.id || '',
                              qty - 1
                            );
                          }}
                        >
                          <Ionicons name="remove" size={16} color="#ea580c" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, styles.qtyBtnActive]}
                          onPress={() => {
                            animateAdd(item.id);
                            addItem(item, 1);
                          }}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.addButton, !item.isAvailable && styles.addButtonDisabled]}
                        onPress={() => {
                          if (!item.isAvailable) return;
                          animateAdd(item.id);
                          addItem(item, 1);
                        }}
                        disabled={!item.isAvailable}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#fff" />
                        <Text style={styles.addButtonText}>
                          {item.isAvailable ? 'Add' : 'N/A'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryPill: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  categoryPillActive: {
    backgroundColor: 'transparent',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryPillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  itemList: {
    padding: 20,
    gap: 14,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImageContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 44,
  },
  itemInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ea580c',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ea580c',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnActive: {
    backgroundColor: '#ea580c',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 28,
    textAlign: 'center',
  },
});
