const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verify the webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = stripeEvent.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Here you can:
      // 1. Save the payment to your database
      // 2. Send a confirmation email
      // 3. Update user subscription status
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = stripeEvent.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    case 'customer.subscription.created':
      const subscription = stripeEvent.data.object;
      console.log('Subscription created:', subscription.id);
      // Handle new subscription
      break;
    case 'customer.subscription.deleted':
      const canceledSubscription = stripeEvent.data.object;
      console.log('Subscription canceled:', canceledSubscription.id);
      // Handle canceled subscription
      break;
    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};