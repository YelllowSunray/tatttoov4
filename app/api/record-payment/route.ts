import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/firestore';

/**
 * API endpoint to record payment after successful Stripe checkout
 * This should be called after payment is verified
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either userId or email is required' },
        { status: 400 }
      );
    }

    // Record payment in Firestore
    await recordPayment(userId || undefined, email || undefined);

    return NextResponse.json({ 
      success: true,
      message: 'Payment recorded successfully. Generation limit initialized.' 
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

