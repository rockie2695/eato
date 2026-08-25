/**
 * Socket.io Hook.
 *
 * Manages Socket.io connection for real-time order updates.
 * Automatically connects/disconnects based on auth state.
 */

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores';
import type { OrderUpdateEvent, NewOrderEvent } from '@eato/shared/types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UseSocketReturn {
  isConnected: boolean;
  subscribeToOrder: (orderId: string) => void;
  unsubscribeFromOrder: (orderId: string) => void;
  onOrderUpdate: (callback: (event: OrderUpdateEvent) => void) => () => void;
  onNewOrder: (callback: (event: NewOrderEvent) => void) => () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  /** Subscribe to order status updates */
  const subscribeToOrder = (orderId: string) => {
    socketRef.current?.emit('order:subscribe', orderId);
  };

  /** Unsubscribe from order updates */
  const unsubscribeFromOrder = (orderId: string) => {
    socketRef.current?.emit('order:unsubscribe', orderId);
  };

  /** Listen for order status updates */
  const onOrderUpdate = (callback: (event: OrderUpdateEvent) => void) => {
    socketRef.current?.on('order:statusUpdate', callback);
    return () => socketRef.current?.off('order:statusUpdate', callback);
  };

  /** Listen for new orders (staff/kitchen) */
  const onNewOrder = (callback: (event: NewOrderEvent) => void) => {
    socketRef.current?.on('order:new', callback);
    return () => socketRef.current?.off('order:new', callback);
  };

  return {
    isConnected,
    subscribeToOrder,
    unsubscribeFromOrder,
    onOrderUpdate,
    onNewOrder,
  };
}
