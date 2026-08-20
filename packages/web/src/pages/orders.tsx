/**
 * Orders Page.
 *
 * Displays order history and current order tracking.
 * Shows real-time status updates via Socket.io.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderSkeleton } from '@/components/ui/order-skeleton';
import { useOrderStore, useAuthStore } from '@/stores';
import { useSocket } from '@/hooks/useSocket';
import { formatPrice, formatRelativeTime } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { Order, OrderStatus } from '@eato/shared/types';

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, isLoading, loadMyOrders, updateOrderStatus } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const { onOrderUpdate } = useSocket();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyOrders();
  }, [isAuthenticated]);

  // Listen for real-time order updates
  useEffect(() => {
    const unsubscribe = onOrderUpdate((event) => {
      updateOrderStatus(event.orderId, event.status);
    });
    return () => { unsubscribe(); };
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o: { status: string }) => o.status === filter);

  const statusFilters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            Track your current and past orders
          </p>
        </div>
        <Button onClick={() => navigate('/menu')}>
          Order More
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {statusFilters.map((sf) => (
          <Button
            key={sf.value}
            variant={filter === sf.value ? 'default' : 'outline'}
            onClick={() => setFilter(sf.value)}
            className="whitespace-nowrap"
          >
            {sf.label}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-muted-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <Badge className={statusConfig?.bgColor + ' ' + statusConfig?.color}>
                {statusConfig?.label || order.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              {order.tableNumber && ` • Table ${order.tableNumber}`}
            </p>

            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
