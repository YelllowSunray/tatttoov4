import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export async function initiateCheckout(userId?: string, userEmail?: string) {
  try {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error(
        'Stripe is not configured. Please add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file. See STRIPE_SETUP.md for instructions.'
      );
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from server:', text.substring(0, 500));
      throw new Error('Server returned an invalid response. Please check your Stripe configuration.');
    }

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();

    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      // Fallback: use Stripe.js to redirect
      const stripe = await stripePromise;
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      } else {
        throw new Error('Stripe failed to initialize');
      }
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    alert(error.message || 'Failed to initiate checkout. Please try again.');
    throw error;
  }
}

