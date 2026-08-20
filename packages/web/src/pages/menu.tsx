/**
 * Menu Page.
 *
 * Displays the restaurant menu with category filtering and search.
 * Shows featured items prominently at the top.
 */

import { useState, useEffect } from 'react';
import { Search, Clock, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores';
import { menuApi } from '@/lib/api';
import { formatPrice, formatPrepTime } from '@eato/shared/utils';
import type { MenuItemWithCategory, MenuCategory } from '@eato/shared/types';

export function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCartStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, searchQuery]);

  async function loadData() {
    try {
      const [cats, featured] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getFeatured(),
      ]);
      setCategories(cats);
      setItems(featured);
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
        search: searchQuery || undefined,
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

  function handleAddItem(item: MenuItemWithCategory) {
    addItem(item, 1);
  }

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground text-lg">
          Discover our delicious dishes crafted with fresh ingredients
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className="whitespace-nowrap"
        >
          All Items
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            {/* Image placeholder */}
            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
              {item.isFeatured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.price)}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                {item.preparationTime && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatPrepTime(item.preparationTime)}
                  </span>
                )}
                <Badge variant="secondary" className="text-xs">
                  {item.category.name}
                </Badge>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex items-center gap-2">
                {getCartQuantity(item.id) > 0 ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => {
                        const qty = getCartQuantity(item.id);
                        if (qty > 1) {
                          // Would need to update quantity
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-center font-medium">
                      {getCartQuantity(item.id)}
                    </span>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAddItem(item)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleAddItem(item)}
                    disabled={!item.isAvailable}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      )}
    </div>
  );
}
