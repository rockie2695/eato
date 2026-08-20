/**
 * Payment Routes.
 *
 * Handles Stripe webhook for payment status updates.
 * POST /api/v1/payments/webhook - Stripe webhook endpoint
 */

import { Router, raw } from 'express';
import { constructWebhookEvent } from '../../config/stripe.js';
import { prisma } from '../../config/database.js';

const router = Router();

/**
 * POST /webhook
 * Stripe webhook endpoint.
 * Handles checkout.session.completed and other payment events.
 *
 * IMPORTANT: This route must use raw body parser, not JSON.
 */
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(400).json({ message: 'Missing stripe-signature header' });
      return;
    }

    let event;
    try {
      event = constructWebhookEvent(req.body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).json({ message: 'Invalid signature' });
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order payment status
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'paid',
              status: 'confirmed',
            },
          });

          console.log(`✅ Payment completed for order ${orderId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const orderId = (intent.metadata as Record<string, string>)?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'failed',
            },
          });

          console.log(`❌ Payment failed for order ${orderId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
