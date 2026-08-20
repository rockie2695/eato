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
 * @swagger
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook endpoint
 *     description: |
 *       Handles Stripe payment events (checkout.session.completed, payment_intent.payment_failed).
 *
 *       **Note:** This endpoint requires raw body for signature verification.
 *       Do not send this request through the JSON body parser.
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe event object
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing stripe-signature header
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
