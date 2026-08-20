/**
 * Order Detail Page.
 *
 * Shows detailed order information with real-time status tracking.
 * Displays order items, status timeline, and payment info.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  ChefHat,
  Bell,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderStore } from '@/stores';
import { useSocket } from '@/hooks/useSocket';
import { formatPrice, formatDate } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { OrderStatus } from '@eato/shared/types';

const STATUS_TIMELINE: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, getOrder, updateOrderStatus, isLoading } = useOrderStore();
  const { subscribeToOrder, unsubscribeFromOrder, onOrderUpdate } = useSocket();

  useEffect(() => {
    if (id) {
      getOrder(id);
      subscribeToOrder(id);
    }
    return () => {
      if (id) unsubscribeFromOrder(id);
    };
  }, [id]);

  useEffect(() => {
    const unsubscribe = onOrderUpdate((event) => {
      if (event.orderId === id) {
        updateOrderStatus(event.orderId, event.status);
      }
    });
    return unsubscribe;
  }, [id]);

  if (isLoading || !currentOrder) {
    return (
      <div className="container px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const order = currentOrder;
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const currentStep = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="container px-4 py-8 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/orders')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge className={statusConfig?.bgColor + ' ' + statusConfig?.color + ' text-base px-4 py-1'}>
          {statusConfig?.label || order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{
                width: `${(currentStep / (STATUS_TIMELINE.length - 1)) * 100}%`,
              }}
            />

            {STATUS_TIMELINE.map((status, index) => {
              const config = ORDER_STATUS_CONFIG[status];
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={status}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {config?.label || status}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{item.menuItem?.name || 'Menu Item'}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-xs text-muted-foreground italic">
                      "{item.specialInstructions}"
                    </p>
                  )}
                </div>
                <p className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>{formatPrice(Math.round(order.totalAmount * 0.1))}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-primary">
                {formatPrice(Math.round(order.totalAmount * 1.1))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.paymentMethod}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.tableNumber && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Table Number</p>
                  <p className="text-sm text-muted-foreground">
                    Table {order.tableNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
