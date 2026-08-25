/**
 * Stripe configuration and helpers.
 *
 * Initializes the Stripe SDK and provides helper functions
 * for payment processing.
 */

import Stripe from 'stripe';
import { config } from './index.js';

/** Stripe SDK instance */
export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-21.basil' as Stripe.LatestApiVersion,
  typescript: true,
});

/**
 * Create a Stripe Checkout Session for an order.
 * @param orderId - The order ID
 * @param amount - Total amount in cents
 * @param items - Line items for the checkout
 * @returns Stripe session object
 */
export async function createCheckoutSession(
  orderId: string,
  amount: number,
  items: { name: string; quantity: number; price: number }[]
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${config.WEB_URL}/orders/${orderId}?success=true`,
    cancel_url: `${config.WEB_URL}/cart?canceled=true`,
    metadata: {
      orderId,
    },
  });

  return session;
}

/**
 * Construct and verify a Stripe webhook event.
 * @param payload - Raw request body
 * @param signature - Stripe-Signature header value
 * @returns Verified Stripe event
 */
export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.STRIPE_WEBHOOK_SECRET
  );
}
