const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount, currency = 'eur', isMonthly = false } = JSON.parse(event.body);
    
    // Validate the amount
    if (amount < 50) { // Minimum amount of €0.50
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount must be at least €0.50' }),
      };
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      // For subscriptions, you would set up differently
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        isMonthly: isMonthly.toString()
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};