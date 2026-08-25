/**
 * Cart Page — Premium Redesign.
 *
 * Glass morphism summary, stagger animations,
 * gradient accents, and expressive micro-interactions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowLeft,
  Hash,
  MessageSquare,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore, useAuthStore } from '@/stores';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@eato/shared/utils';
import type { PaymentMethod, CartItem } from '@eato/shared/types';

/* ─────────────────────────── Empty State ─────────────────────────── */

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 food-gradient rounded-full blur-3xl opacity-20 animate-pulse-glow" />
        <div className="relative bg-gradient-to-br from-primary/10 to-orange-400/10 rounded-3xl p-10 animate-float">
          <ShoppingBag className="h-20 w-20 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-3 animate-fade-in-up">
        Your cart is empty
      </h2>
      <p
        className="text-muted-foreground mb-8 text-center max-w-sm animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        Add some delicious items from our menu to get started
      </p>

      <Button
        variant="gradient"
        size="xl"
        onClick={onBrowse}
        className="animate-fade-in-up hover-lift"
        style={{ animationDelay: '0.2s' }}
      >
        <ShoppingBag className="h-5 w-5 mr-2" />
        Browse Menu
      </Button>
    </div>
  );
}

/* ──────────────────────── Quantity Controls ──────────────────────── */

function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const [bouncing, setBouncing] = useState<'+' | '-' | null>(null);

  function triggerBounce(dir: '+' | '-') {
    setBouncing(dir);
    setTimeout(() => setBouncing(null), 300);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => {
          onDecrement();
          triggerBounce('-');
        }}
        className="h-9 w-9 rounded-full border border-border bg-background flex items-center justify-center
                   text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200
                   active:scale-90"
      >
        <Minus
          className={`h-4 w-4 transition-transform duration-200 ${bouncing === '-' ? 'scale-75' : 'scale-100'
            }`}
        />
      </button>
      <span className="w-8 text-center font-semibold tabular-nums text-lg">
        {quantity}
      </span>
      <button
        onClick={() => {
          onIncrement();
          triggerBounce('+');
        }}
        className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center
                   hover:bg-primary/90 transition-all duration-200 active:scale-90 shadow-sm"
      >
        <Plus
          className={`h-4 w-4 transition-transform duration-200 ${bouncing === '+' ? 'scale-75' : 'scale-100'
            }`}
        />
      </button>
    </div>
  );
}

/* ───────────────────────── Cart Item Row ─────────────────────────── */

function CartItemRow({
  item,
  index,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  index: number;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  function handleRemove() {
    setIsRemoving(true);
    setTimeout(onRemove, 250);
  }

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 ${isRemoving
          ? 'opacity-0 scale-95 -translate-x-4'
          : 'opacity-100 translate-y-0'
        }`}
      style={{
        animationDelay: `${index * 0.06}s`,
        animation: 'fade-in-up 0.5s ease-out both',
      }}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="h-20 w-20 rounded-xl food-gradient flex items-center justify-center flex-shrink-0 shadow-md">
            {item.menuItem?.image ? (
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-2xl drop-shadow">🍽️</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {item.menuItem?.name || 'Menu Item'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatPrice(item.price)} each
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                           text-muted-foreground hover:text-destructive hover:bg-destructive/10
                           transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {item.specialInstructions && (
              <p className="text-xs text-muted-foreground mt-1.5 italic truncate">
                "{item.specialInstructions}"
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <QuantityControl
                quantity={item.quantity}
                onIncrement={() => onQuantityChange(item.quantity + 1)}
                onDecrement={() =>
                  item.quantity > 1
                    ? onQuantityChange(item.quantity - 1)
                    : handleRemove()
                }
              />
              <span className="font-bold text-foreground tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Payment Toggle ──────────────────── */

function PaymentToggle({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50">
      {(['cash', 'online'] as const).map((method) => (
        <button
          key={method}
          onClick={() => onChange(method)}
          className={`relative flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium
                     transition-all duration-300 ${value === method
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {method === 'cash' ? (
            <Banknote className="h-4 w-4" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {method === 'cash' ? 'Cash' : 'Online'}
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────── Main Page ────────────────────────────── */

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totalAmount,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    tableNumber,
    setTableNumber,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const tax = Math.round(totalAmount * 0.1);
  const grandTotal = totalAmount + tax;

  async function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const order = await orderApi.create({
        tableNumber: tableNumber || undefined,
        paymentMethod,
        notes: notes || undefined,
        items: items.map((item: CartItem) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
      });

      clearCart();

      if (paymentMethod === 'online') {
        navigate(`/orders/${order.id}?checkout=true`);
      } else {
        navigate(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  }

  /* ── Empty ── */
  if (items.length === 0) {
    return <EmptyCart onBrowse={() => navigate('/menu')} />;
  }

  /* ── Populated ── */
  return (
    <div className="flex justify-center">
      <div className="container max-w-6xl px-4 py-8 page-transition">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/menu')}
            className="group/btn"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover/btn:-translate-x-1" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} waiting for you
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ──────────── Items Column ──────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="stagger-children">
              {items.map((item: CartItem, i) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  index={i}
                  onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>

            {/* Clear Cart */}
            {showClearConfirm ? (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 animate-fade-in">
                <span className="text-sm text-foreground">Clear your entire cart?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                >
                  Yes, clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground
                         hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5
                         transition-all duration-300"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* ──────────── Summary Column ──────────── */}
          <div className="lg:sticky lg:top-24">
            <Card
              className="glass-strong overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '0.15s' }}
            >
              {/* Decorative gradient strip */}
              <div className="h-1 food-gradient" />

              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg font-bold tracking-tight">Order Summary</h2>

                {/* Table Number */}
                <Input
                  label="Table Number"
                  type="number"
                  placeholder="Optional"
                  icon={<Hash className="h-4 w-4" />}
                  value={tableNumber || ''}
                  onChange={(e) =>
                    setTableNumber(e.target.value ? Number(e.target.value) : null)
                  }
                  min={1}
                />

                {/* Payment Method */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Payment Method
                  </label>
                  <PaymentToggle value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                {/* Notes */}
                <Input
                  label="Order Notes"
                  placeholder="Any special requests..."
                  icon={<MessageSquare className="h-4 w-4" />}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Items ({itemCount})</span>
                    <span className="tabular-nums">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span className="tabular-nums">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-border/50">
                    <span className="font-semibold text-base">Total</span>
                    <span className="text-2xl font-bold gradient-text tabular-nums">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout */}
                <Button
                  variant="glow"
                  size="xl"
                  className="w-full text-base font-semibold hover-lift"
                  onClick={handleCheckout}
                  loading={isCheckingOut}
                >
                  Place Order
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {paymentMethod === 'online'
                    ? 'Secure checkout via Stripe'
                    : 'Pay at the counter'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
