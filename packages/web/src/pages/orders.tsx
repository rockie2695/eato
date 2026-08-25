import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  Copy,
  Check,
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderSkeleton } from '@/components/ui/order-skeleton';
import { useOrderStore, useAuthStore } from '@/stores';
import { useSocket } from '@/hooks/useSocket';
import { formatPrice, formatRelativeTime } from '@eato/shared/utils';
import { ORDER_STATUS_CONFIG } from '@eato/shared/constants';
import type { Order, OrderStatus } from '@eato/shared/types';

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'All', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="h-3.5 w-3.5" /> },
  { value: 'confirmed', label: 'Confirmed', icon: <Check className="h-3.5 w-3.5" /> },
  { value: 'preparing', label: 'Preparing', icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { value: 'ready', label: 'Ready', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { value: 'completed', label: 'Completed', icon: <Package className="h-3.5 w-3.5" /> },
];

const STATUS_ACCENT: Record<string, string> = {
  pending: 'border-l-yellow-500',
  confirmed: 'border-l-blue-500',
  preparing: 'border-l-orange-500',
  ready: 'border-l-green-500',
  served: 'border-l-purple-500',
  completed: 'border-l-emerald-500',
  cancelled: 'border-l-red-500',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, isLoading, loadMyOrders, updateOrderStatus } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const { onOrderUpdate } = useSocket();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [flashingId, setFlashingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    const unsubscribe = onOrderUpdate((event) => {
      updateOrderStatus(event.orderId, event.status);
      setFlashingId(event.orderId);
      setTimeout(() => setFlashingId(null), 1500);
    });
    return () => { unsubscribe(); };
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o: { status: string }) => o.status === filter);

  const getOrderCount = useCallback(
    (status: OrderStatus | 'all') =>
      status === 'all' ? orders.length : orders.filter((o: { status: string }) => o.status === status).length,
    [orders]
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 var(--color-primary, #f97316); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
        @keyframes flashHighlight {
          0% { background-color: color-mix(in srgb, var(--color-primary, #f97316) 20%, transparent); }
          100% { background-color: transparent; }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .order-card-stagger { animation: fadeSlideUp 0.5s ease-out both; }
        .pulse-active { animation: pulseGlow 2s ease-in-out infinite; }
        .flash-update { animation: flashHighlight 1.5s ease-out; }
        .arrow-bounce:hover .arrow-icon { animation: arrowBounce 0.6s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary, #f97316), #fb923c, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your current and past orders
          </p>
        </div>
        <Button
          onClick={() => navigate('/menu')}
          className="arrow-bounce gap-2 rounded-full px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
        >
          Order More
          <ArrowRight className="arrow-icon h-4 w-4" />
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide -mx-1 px-1">
        {STATUS_FILTERS.map((sf) => {
          const active = filter === sf.value;
          const count = getOrderCount(sf.value);
          return (
            <button
              key={sf.value}
              onClick={() => setFilter(sf.value)}
              className={`
                relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium
                transition-all duration-300 shrink-0 border
                ${active
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}
              `}
            >
              {sf.icon}
              {sf.label}
              {count > 0 && (
                <span
                  className={`
                    ml-0.5 inline-flex items-center justify-center rounded-full text-xs font-bold min-w-[1.25rem] h-5 px-1
                    transition-colors duration-300
                    ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            When you place your first order, it will appear here so you can track it in real time.
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="gap-2 rounded-full px-6 font-semibold"
          >
            Start Ordering
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: Order, index: number) => (
            <OrderCard
              key={order.id}
              order={order}
              index={index}
              isFlashing={flashingId === order.id}
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
  index,
  isFlashing,
  onClick,
}: {
  order: Order;
  index: number;
  isFlashing: boolean;
  onClick: () => void;
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const isActive = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`#${order.id.slice(0, 8).toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card
      className={`
        order-card-stagger cursor-pointer border-l-4 ${STATUS_ACCENT[order.status] || 'border-l-muted'}
        hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
        transition-all duration-300 ease-out
        ${isFlashing ? 'flash-update' : ''}
      `}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Order ID + Status */}
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors group"
              >
                #{order.id.slice(0, 8).toUpperCase()}
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <Badge
                className={`
                  ${statusConfig?.bgColor} ${statusConfig?.color}
                  rounded-full text-xs font-semibold px-2.5 py-0.5
                  ${isActive ? 'pulse-active' : ''}
                `}
              >
                {statusConfig?.label || order.status}
              </Badge>
            </div>

            {/* Items + Table */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              {order.tableNumber && (
                <>
                  <span className="text-border">·</span>
                  <span>Table {order.tableNumber}</span>
                </>
              )}
            </div>

            {/* Time */}
            <p className="text-xs text-muted-foreground/70">
              {formatRelativeTime(order.createdAt)}
            </p>
          </div>

          {/* Price */}
          <div className="sm:text-right flex-shrink-0">
            <p
              className="text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary, #f97316), #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
