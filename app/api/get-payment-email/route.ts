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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.customer_details?.email) {
      return NextResponse.json({ 
        email: session.customer_details.email,
        verified: true 
      });
    } else {
      return NextResponse.json({ 
        error: 'Payment not completed or email not found' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error getting payment email:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get payment email' 
    }, { status: 500 });
  }
}

