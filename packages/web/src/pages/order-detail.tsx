import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Circle,
  CreditCard,
  ChefHat,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/page-loading';
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

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'Your order has been received',
  confirmed: 'Restaurant has confirmed your order',
  preparing: 'Your food is being prepared',
  ready: 'Your order is ready for pickup',
  served: 'Your order has been served',
  completed: 'Order completed. Enjoy your meal!',
  cancelled: 'Order was cancelled',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, getOrder, updateOrderStatus, isLoading } = useOrderStore();
  const { subscribeToOrder, unsubscribeFromOrder, onOrderUpdate } = useSocket();
  const [flash, setFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
        if (event.status === 'completed' || event.status === 'served') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    });
    return () => { unsubscribe(); };
  }, [id]);

  if (isLoading || !currentOrder) {
    return <PageLoading text="Loading order details..." />;
  }

  const order = currentOrder;
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const currentStep = STATUS_TIMELINE.indexOf(order.status);
  const subtotal = order.totalAmount;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 var(--color-primary, #f97316); }
          50% { box-shadow: 0 0 0 8px transparent; }
        }
        @keyframes lineGrow {
          from { height: 0%; }
          to { height: var(--line-height, 100%); }
        }
        @keyframes flashHighlight {
          0% { background-color: color-mix(in srgb, var(--color-primary, #f97316) 15%, transparent); }
          100% { background-color: transparent; }
        }
        @keyframes arrowSlide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .detail-stagger { animation: fadeSlideUp 0.5s ease-out both; }
        .timeline-step { animation: slideInRight 0.4s ease-out both; }
        .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
        .line-fill { animation: lineGrow 1s ease-out forwards; }
        .flash-update { animation: flashHighlight 1.5s ease-out; }
        .back-arrow:hover svg { animation: arrowSlide 0.6s ease-in-out infinite; }
        .count-animate { animation: countUp 0.4s ease-out both; }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confettiFall 2s ease-out forwards;
        }
      `}</style>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${Math.random() * 30}%`,
                backgroundColor: ['#f97316', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][i % 6],
                animationDelay: `${Math.random() * 0.8}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="back-arrow flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Orders</span>
      </button>

      {/* Header */}
      <div
        className={`mb-8 detail-stagger ${flash ? 'flash-update rounded-xl' : ''}`}
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary, #f97316), #fb923c, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <Badge
            className={`
              ${statusConfig?.bgColor} ${statusConfig?.color}
              text-sm px-4 py-1.5 rounded-full font-semibold self-start
              ${['pending', 'confirmed', 'preparing', 'ready'].includes(order.status) ? 'pulse-glow' : ''}
            `}
          >
            {statusConfig?.label || order.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Placed on {formatDate(order.createdAt)}
        </div>
      </div>

      {/* Status Timeline */}
      <Card
        className={`mb-6 detail-stagger ${flash ? 'flash-update' : ''}`}
        style={{ animationDelay: '100ms' }}
      >
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Order Progress
          </h2>

          <div className="relative">
            {/* Vertical line track */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

            {/* Filled line */}
            <div
              className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-primary via-primary to-primary/60 line-fill"
              style={{
                '--line-height': `${currentStep >= 0 ? (currentStep / (STATUS_TIMELINE.length - 1)) * 100 : 0}%`,
                height: `${currentStep >= 0 ? (currentStep / (STATUS_TIMELINE.length - 1)) * 100 : 0}%`,
              } as React.CSSProperties}
            />

            {/* Steps */}
            <div className="space-y-0">
              {STATUS_TIMELINE.map((status, index) => {
                const config = ORDER_STATUS_CONFIG[status];
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const isFuture = index > currentStep;

                return (
                  <div
                    key={status}
                    className="timeline-step relative flex items-start gap-4 py-4"
                    style={{ animationDelay: `${150 + index * 80}ms` }}
                  >
                    {/* Circle */}
                    <div
                      className={`
                        relative z-10 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                        transition-all duration-500 border-2
                        ${isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground'}
                        ${isCurrent ? 'pulse-glow ring-4 ring-primary/20' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                      {isCurrent && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>

                    {/* Label + Description */}
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p
                        className={`text-sm font-semibold ${
                          isFuture ? 'text-muted-foreground/50' : 'text-foreground'
                        }`}
                      >
                        {config?.label || status}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isFuture ? 'text-muted-foreground/40' : 'text-muted-foreground'
                        }`}
                      >
                        {STATUS_DESCRIPTIONS[status]}
                      </p>
                    </div>

                    {/* Current indicator */}
                    {isCurrent && (
                      <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 mt-1.5">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card
        className={`mb-6 detail-stagger ${flash ? 'flash-update' : ''}`}
        style={{ animationDelay: '200ms' }}
      >
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            Order Items
          </h2>

          <div className="space-y-0">
            {order.items.map(
              (
                item: {
                  id: string;
                  menuItem?: { name: string };
                  quantity: number;
                  price: number;
                  specialInstructions?: string;
                },
                idx: number
              ) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-foreground">
                        {item.menuItem?.name || 'Menu Item'}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        ×{item.quantity}
                      </span>
                    </div>
                    {item.specialInstructions && (
                      <p className="text-xs text-muted-foreground italic mt-1 pl-0 border-l-2 border-primary/30 ml-0.5 pl-2">
                        "{item.specialInstructions}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <p className="font-semibold text-foreground ml-4 count-animate" style={{ animationDelay: `${300 + idx * 60}ms` }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-border/50 mt-3 pt-4 space-y-2.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (10%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-3">
              <span>Total</span>
              <span
                className="count-animate"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary, #f97316), #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Table Info */}
      <div
        className="grid grid-cols-2 gap-3 detail-stagger"
        style={{ animationDelay: '300ms' }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="text-sm font-semibold capitalize truncate">
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
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Table</p>
                  <p className="text-sm font-semibold truncate">
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
