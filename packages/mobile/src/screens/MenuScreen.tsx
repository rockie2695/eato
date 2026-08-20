/**
 * Menu Screen.
 *
 * Displays menu items with category filtering.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { menuApi } from '../stores';
import { useCartStore } from '../stores';
import type { MenuItemWithCategory, MenuCategory } from '@eato/shared/types';
import { formatPrice } from '@eato/shared/utils';

export function MenuScreen() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCartStore();

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: 'all', name: 'All' } as MenuCategory, ...categories]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === item.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === item.id && styles.categoryTabTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Menu Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemList}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemImage}>
              <Text style={styles.itemEmoji}>🍽️</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                {getCartQuantity(item.id) > 0 ? (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>
                      {getCartQuantity(item.id)} in cart
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addItem(item, 1)}
                    disabled={!item.isAvailable}
                  >
                    <Text style={styles.addButtonText}>
                      {item.isAvailable ? 'Add' : 'Unavailable'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
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
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  categoryTabActive: {
    backgroundColor: '#ea580c',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  itemList: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 100,
    height: 100,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 40,
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  addButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantityText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '500',
  },
});
