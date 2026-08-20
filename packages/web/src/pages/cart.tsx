/**
 * Cart Page.
 *
 * Displays shopping cart with items, quantity controls, and checkout.
 * Supports table number selection for dine-in orders.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useCartStore, useAuthStore } from '@/stores';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@eato/shared/utils';
import type { PaymentMethod, CartItem } from '@eato/shared/types';

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
        // Redirect to Stripe checkout
        // In real app, would use the stripeSessionId
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

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some delicious items from our menu
        </p>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/menu')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: CartItem) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Item Image Placeholder */}
                  <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                    {item.menuItem?.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.menuItem?.name || 'Menu Item'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {item.specialInstructions && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <span className="ml-auto font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={clearCart} className="w-full">
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Table Number */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Table Number (optional)
                </label>
                <Input
                  type="number"
                  placeholder="Enter table #"
                  value={tableNumber || ''}
                  onChange={(e) =>
                    setTableNumber(e.target.value ? Number(e.target.value) : null)
                  }
                  min={1}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className="w-full"
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === 'online' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('online')}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Order Notes
                </label>
                <Input
                  placeholder="Any special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(Math.round(totalAmount * 0.1))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(Math.round(totalAmount * 1.1))}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? <Spinner size="sm" label="Processing..." /> : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
