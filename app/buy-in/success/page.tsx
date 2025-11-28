'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuyInSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch email from Stripe session and store payment info
    const fetchPaymentEmail = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Store payment session in sessionStorage to grant access
        sessionStorage.setItem('payment_session_id', sessionId);
        sessionStorage.setItem('has_paid', 'true');

        // Fetch email from Stripe session
        const response = await fetch('/api/get-payment-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.email) {
          // Store email for later use (consultation saving, etc.)
          sessionStorage.setItem('payment_email', data.email);
          sessionStorage.setItem('verified_payment_email', data.email);
        }
      } catch (error) {
        console.error('Error fetching payment email:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentEmail();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-black bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-base sm:text-lg font-light tracking-[0.15em] text-black uppercase">
                Tattoo Discovery
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-black uppercase tracking-[0.15em]">
              Payment Successful
            </h1>
            <div className="w-24 h-px bg-black/20 mx-auto"></div>
          </div>

          <div className="space-y-6">
            <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light">
              Thank you for your purchase! Your payment of €100 has been processed successfully.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-black/70 font-light">
                You're all set! Start creating your tattoo designs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/beginners"
                  className="inline-block rounded-full bg-black px-6 py-3 text-xs font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                >
                  Start Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}


