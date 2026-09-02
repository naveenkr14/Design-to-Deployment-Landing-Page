import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeRouter = Router();
export const stripeWebhookRouter = Router();

const PRICE_IDS = {
  solo:   process.env.STRIPE_SOLO_PRICE_ID,
  studio: process.env.STRIPE_STUDIO_PRICE_ID,
};

// POST /api/stripe/checkout?plan=solo|studio
stripeRouter.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const plan = req.query.plan || req.body.plan;
    const priceId = PRICE_IDS[plan];
    if (!priceId) return res.status(400).json({ error: 'Invalid plan. Use solo or studio.' });

    let { data: profile } = await supabaseAdmin
      .from('users').select('stripe_customer_id').eq('id', req.user.id).single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { supabase_uid: req.user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?upgrade=success`,
      cancel_url:  `${process.env.CLIENT_URL}/pricing?cancelled=1`,
      subscription_data: { trial_period_days: 14 },
    });

    res.json({ url: session.url });
  } catch (err) { next(err); }
});

// POST /api/stripe/portal
stripeRouter.post('/portal', requireAuth, async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('users').select('stripe_customer_id').eq('id', req.user.id).single();
    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found. Subscribe to a plan first.' });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });
    res.json({ url: session.url });
  } catch (err) { next(err); }
});

// POST /webhook/stripe (raw body, mounted before express.json)
stripeWebhookRouter.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const PLAN_MAP = {};
  if (process.env.STRIPE_SOLO_PRICE_ID) PLAN_MAP[process.env.STRIPE_SOLO_PRICE_ID] = 'solo';
  if (process.env.STRIPE_STUDIO_PRICE_ID) PLAN_MAP[process.env.STRIPE_STUDIO_PRICE_ID] = 'studio';

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.mode === 'subscription' && session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = sub.items.data[0]?.price?.id;
      const plan = PLAN_MAP[priceId] || 'solo';
      await supabaseAdmin.from('users').update({ plan }).eq('stripe_customer_id', session.customer);
      console.log(`Upgraded customer ${session.customer} to ${plan}`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await supabaseAdmin.from('users').update({ plan: 'free' }).eq('stripe_customer_id', sub.customer);
    console.log(`Customer ${sub.customer} cancelled — downgraded to free`);
  }

  res.json({ received: true });
});
