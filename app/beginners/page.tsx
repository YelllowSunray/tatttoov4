'use client';

import { useState, useEffect } from 'react';
import { BeginnersQuestionnaire } from '@/components/BeginnersQuestionnaire';
import { useAuth } from '@/contexts/AuthContext';
import { initiateCheckout } from '@/lib/stripe-checkout';

export default function BeginnersPage() {
  const { user, loading } = useAuth();
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    // Check if user has paid via sessionStorage
    if (typeof window !== 'undefined') {
      const paid = sessionStorage.getItem('has_paid') === 'true';
      const sessionId = sessionStorage.getItem('payment_session_id');
      setHasPaid(paid);
      setPaymentSessionId(sessionId);
    }
  }, []);

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setVerifying(true);

    if (!paymentSessionId) {
      setVerificationError('Payment session not found. Please complete payment first.');
      setVerifying(false);
      return;
    }

    try {
      const response = await fetch('/api/verify-payment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: paymentSessionId,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.verified) {
        setEmailVerified(true);
        // Store verified email for access and Firebase saving
        const normalizedEmail = email.trim().toLowerCase();
        sessionStorage.setItem('verified_payment_email', normalizedEmail);
        sessionStorage.setItem('payment_email', normalizedEmail);
      }
    } catch (error: any) {
      setVerificationError(error.message || 'Failed to verify email. Please check and try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto"></div>
          <p className="text-black/60 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show questionnaire
  if (user) {
    return (
      <div className="min-h-screen bg-white">
        <BeginnersQuestionnaire />
      </div>
    );
  }

  // If user has paid and email is verified, show questionnaire
  if (hasPaid && emailVerified) {
    return (
      <div className="min-h-screen bg-white">
        <BeginnersQuestionnaire />
      </div>
    );
  }

  // If user has paid but email not verified, show email verification form
  if (hasPaid && !emailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-light uppercase tracking-[0.15em] text-black">
              Verify Your Payment
            </p>
            <p className="text-sm text-black/60">
              Please enter the email address you used during the Stripe payment process to access the beginners questionnaire.
            </p>
          </div>

          <form onSubmit={handleEmailVerification} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your payment email"
                required
                className="w-full px-4 py-3 border border-black/20 focus:border-black focus:outline-none text-black placeholder:text-black/40"
                disabled={verifying}
              />
            </div>

            {verificationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {verificationError}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying || !email.trim()}
              className="w-full rounded-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={async () => {
                try {
                  await initiateCheckout();
                } catch (error) {
                  console.error('Checkout failed:', error);
                }
              }}
              className="text-xs text-black/40 hover:text-black transition-colors uppercase tracking-[0.1em]"
            >
              Need to make a payment?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user hasn't paid, show payment option
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <p className="text-lg font-light uppercase tracking-[0.15em] text-black">
          Sign in required
        </p>
        <p className="mt-4 text-sm text-black/60">
          Create an account or sign in to access the beginners questionnaire and save your personalized tattoo recommendations.
        </p>
        <button
          onClick={async () => {
            try {
              await initiateCheckout();
            } catch (error) {
              console.error('Checkout failed:', error);
            }
          }}
          className="mt-8 rounded-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-black/90"
        >
          Buy In
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <BeginnersQuestionnaire />
    </div>
  );
}

