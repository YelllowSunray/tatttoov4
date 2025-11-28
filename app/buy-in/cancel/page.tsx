'use client';

import Link from 'next/link';

export default function BuyInCancelPage() {
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
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-black/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-black uppercase tracking-[0.15em]">
              Payment Cancelled
            </h1>
            <div className="w-24 h-px bg-black/20 mx-auto"></div>
          </div>

          <div className="space-y-6">
            <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light">
              Your payment was cancelled. No charges have been made.
            </p>
            <p className="text-sm text-black/50 font-light">
              If you'd like to complete your purchase, you can try again at any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/about"
                className="inline-block rounded-full bg-black px-6 py-3 text-xs font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
              >
                Learn More
              </Link>
              <Link
                href="/"
                className="inline-block rounded-full border border-black px-6 py-3 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


