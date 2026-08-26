import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Star, Plus, Minus, X, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuSkeleton } from '@/components/ui/menu-skeleton';
import { useCartStore } from '@/stores';
import { menuApi } from '@/lib/api';
import { formatPrice, formatPrepTime } from '@eato/shared/utils';
import type { MenuItemWithCategory, MenuCategory } from '@eato/shared/types';

const CATEGORY_ICONS: Record<string, string> = {
  all: '🍽️',
  appetizers: '🥗',
  mains: '🍖',
  desserts: '🍰',
  drinks: '🥤',
  sides: '🍟',
  pizza: '🍕',
  pasta: '🍝',
  sushi: '🍣',
  burgers: '🍔',
  salads: '🥗',
  soups: '🍜',
};

export function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { addItem, items: cartItems, updateQuantity } = useCartStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadItems();
    }
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
    const cartItem = cartItems.find(
      (i: { menuItemId: string; quantity: number }) => i.menuItemId === menuItemId
    );
    return cartItem?.quantity || 0;
  }

  const handleAddItem = useCallback(
    (item: MenuItemWithCategory) => {
      setAddingItemId(item.id);
      addItem(item, 1);
      setTimeout(() => setAddingItemId(null), 300);
    },
    [addItem]
  );

  const handleIncrement = useCallback(
    (item: MenuItemWithCategory) => {
      addItem(item, 1);
    },
    [addItem]
  );

  function findCartItem(menuItemId: string) {
    return cartItems.find(
      (i: { menuItemId: string; id: string }) => i.menuItemId === menuItemId
    );
  }

  const handleDecrement = useCallback(
    (item: MenuItemWithCategory) => {
      const cartItem = findCartItem(item.id);
      if (!cartItem) return;
      const qty = cartItem.quantity;
      if (qty > 1) {
        updateQuantity(cartItem.id, qty - 1);
      } else {
        updateQuantity(cartItem.id, 0);
      }
    },
    [cartItems, updateQuantity]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  if (loading) {
    return <MenuSkeleton />;
  }

  const allCategories = [{ id: 'all', name: 'All Items' } as MenuCategory, ...categories];

  return (
    <div className="min-h-screen pb-24">
      <div className="container px-4 pt-8 pb-4 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            <span className="gradient-text">Our Menu</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Discover our delicious dishes crafted with fresh ingredients
          </p>
        </div>

        {/* ── Search Bar ── */}
        <div
          className="relative mb-6 animate-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          <div
            className={`
              relative flex items-center rounded-2xl border transition-all duration-300 ease-out
              ${searchFocused
                ? 'border-primary/50 shadow-glow bg-card ring-2 ring-primary/10'
                : 'border-border bg-card hover:border-primary/20'
              }
            `}
          >
            <div className="pl-4">
              <Search
                className={`h-5 w-5 transition-colors duration-300 ${searchFocused ? 'text-primary' : 'text-muted-foreground'
                  }`}
              />
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchRef.current?.focus();
                }}
                className="mr-3 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div
          className="mb-8 animate-fade-in sticky top-[66px] z-10 bg-background/80 backdrop-blur-sm border-b border-border/50"
          style={{ animationDelay: '0.2s' }}
        >
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory"
          >
            {allCategories.map((cat) => {
              const isActive = selectedCategory === (cat.id || 'all');
              const icon = CATEGORY_ICONS[cat.id] || '🍽️';

              return (
                <button
                  key={cat.id || 'all'}
                  onClick={() => setSelectedCategory(cat.id || 'all')}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap
                    text-sm font-medium transition-all duration-300 ease-out snap-start
                    ${isActive
                      ? 'text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-primary animate-scale-in" />
                  )}
                  <span className="relative z-10 text-base">{icon}</span>
                  <span className="relative z-10">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Menu Grid ── */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
            {items.map((item) => {
              const quantity = getCartQuantity(item.id);
              const isAdding = addingItemId === item.id;

              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift bg-card flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-40 transition-transform duration-500 group-hover:scale-110">
                          🍽️
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Featured Badge */}
                    {item.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-sm font-bold text-primary shadow-lg">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4 grow flex flex-col">
                    {/* Title + Category */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
                        {item.name}
                      </h3>
                      <Badge variant="secondary" className="shrink-0 text-[11px]">
                        {item.category.name}
                      </Badge>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mb-3">
                      {item.preparationTime && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatPrepTime(item.preparationTime)}
                        </span>
                      )}
                      {!item.isAvailable && (
                        <Badge variant="destructive" className="text-[11px]">
                          Unavailable
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart / Quantity Controls */}
                    <div className="mt-auto">
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between rounded-xl bg-primary/10 p-1 animate-scale-in">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg text-primary hover:bg-primary/20"
                            onClick={() => handleDecrement(item)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-primary text-base tabular-nums min-w-[24px] text-center">
                            {quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg text-primary hover:bg-primary/20"
                            onClick={() => handleIncrement(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className={`w-full rounded-xl font-semibold transition-all duration-300 ${isAdding ? 'scale-95' : ''
                            }`}
                          onClick={() => handleAddItem(item)}
                          disabled={!item.isAvailable}
                          variant="gradient"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              We couldn't find any menu items matching your search. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-xl">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
