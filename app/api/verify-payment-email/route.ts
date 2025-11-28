import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    const { sessionId, email } = await request.json();

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get email from session (customer_email or customer_details)
    const sessionEmail = session.customer_email || session.customer_details?.email || session.metadata?.userEmail;

    // Verify email matches (case-insensitive)
    if (!sessionEmail || sessionEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match the payment record' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      email: sessionEmail,
      verified: true 
    });
  } catch (error: any) {
    console.error('Error verifying payment email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment email' },
      { status: 500 }
    );
  }
}

