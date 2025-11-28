'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';
import { initiateCheckout } from '@/lib/stripe-checkout';

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/">
              <h1 className="text-base sm:text-lg font-light tracking-[0.15em] text-black uppercase">
                Tattoo Discovery
              </h1>
              </Link>
              {user?.displayName && (
                <p className="mt-1.5 text-xs text-black/40 tracking-wide">
                  {user.displayName}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {user && (
                <>
                  <nav className="flex gap-0.5 border-b border-black/10 sm:border-0 pb-2 sm:pb-0 relative">
                    <div className="relative group">
                    <button
                        className="px-4 py-2.5 text-xs font-medium transition-all duration-200 uppercase tracking-[0.1em] min-h-[44px] flex items-center gap-1 text-black/40 hover:text-black/60"
                      >
                        Discover
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute top-full left-0 mt-1 bg-white border border-black/10 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
                        <Link
                          href="/"
                          className="block px-4 py-2.5 text-xs font-medium text-black/60 hover:text-black hover:bg-black/5 uppercase tracking-[0.1em] transition-colors"
                    >
                      Gallery
                        </Link>
                      </div>
                    </div>
                    <Link
                      href="/"
                      className="px-4 py-2.5 text-xs font-medium transition-all duration-200 uppercase tracking-[0.1em] min-h-[44px] flex items-center text-black border-b-2 border-black"
                    >
                      About Us
                    </Link>
                  </nav>
                </>
              )}
              <div className="flex items-center gap-4 sm:gap-6">
                {user && (
                  <Link
                    href="/beginners"
                    className="text-xs text-black/40 hover:text-black transition-colors duration-200 uppercase tracking-[0.1em] min-h-[44px] flex items-center"
                  >
                    Your Consultation
                  </Link>
                )}
                {user ? (
                  <>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="rounded-full border border-black px-5 py-2.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                    >
                      AI Generator
                    </button>
                    <button
                      onClick={signOut}
                      className="rounded-full border border-black px-5 py-2.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await initiateCheckout(undefined, undefined);
                      } catch (error) {
                        console.error('Checkout failed:', error);
                      }
                    }}
                    className="rounded-full bg-black px-5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                  >
                    Buy In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-black uppercase tracking-[0.15em] leading-tight">
                About Tattoo Discovery
              </h1>
              <div className="w-24 h-px bg-black/20 mx-auto"></div>
            </div>
            <div className="space-y-6 text-center">
              <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light">
                We understand that choosing a tattoo is a deeply personal decision. 
                We believe in presenting you with all available options, 
                so you may make an informed choice that truly reflects your vision and values.
              </p>
              <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light">
                Tattoo Discovery bridges the gap between inspiration and realization, offering both 
                carefully curated ready-made designs (€500 - €2,000) and bespoke creations crafted 
                by master artists (€50 - €100,000). We guide you through every step with transparency, 
                expertise, and unwavering commitment to artistic excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black uppercase tracking-[0.15em]">
                Our Mission
              </h2>
              <div className="w-24 h-px bg-black/20 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <h3 className="text-xl font-light text-black uppercase tracking-[0.1em]">
                  Transparency
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  We believe in complete transparency throughout your tattoo journey. 
                  From design selection to artist matching, you'll always know exactly 
                  what to expect, what options are available, and what each path entails. 
                  No hidden fees, no surprises—just clear, honest communication.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-black uppercase tracking-[0.1em]">
                  Artistic Excellence
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Every design in our gallery and every custom creation is held to the 
                  highest standards of artistic quality. We work exclusively with 
                  master artists who demonstrate exceptional skill, creativity, and 
                  dedication to their craft.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-black uppercase tracking-[0.1em]">
                  Personal Choice
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Your body, your story, your choice. We provide comprehensive information 
                  about both ready-made (€500 - €2,000) and custom (€50 - €100,000) options, 
                  empowering you to make the decision that aligns perfectly with your personal 
                  vision, budget, and timeline.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-black uppercase tracking-[0.1em]">
                  Education & Guidance
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  We're committed to educating our clients about tattoo art, the process, 
                  aftercare, and what to expect. Knowledge empowers better decisions, 
                  and we're here to ensure you feel confident and informed every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="border-b border-black/10 bg-black text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">
                How We Work
              </h2>
              <div className="w-24 h-px bg-white/30 mx-auto"></div>
            </div>
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-light text-white/60 mt-1">01</span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                      Consultation & Discovery
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                      Begin with our comprehensive consultation process. We'll discuss your vision, 
                      preferences, style interests, placement ideas, and budget. Ready-made designs 
                      range from €500 to €2,000, while custom creations span from €50 to €100,000. 
                      This initial conversation helps us understand what you're looking for and guides 
                      you toward the path that best suits your needs—whether that's exploring our 
                      curated gallery of ready-made designs or embarking on a custom creation journey.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-light text-white/60 mt-1">02</span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                      Path Selection
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                      Based on your consultation, you'll choose between two distinct paths. The 
                      ready-made path offers immediate access to proven designs from our extensive 
                      gallery. The custom path connects you with master artists who will create 
                      something entirely unique to you. Both paths are valid, beautiful, and 
                      meaningful—the choice is yours.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-light text-white/60 mt-1">03</span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                      Design Development
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                      For ready-made designs, you'll browse our curated collection and select the 
                      perfect piece. For custom work, you'll collaborate directly with your assigned 
                      artist through multiple revision rounds, ensuring the design perfectly captures 
                      your vision before any ink touches skin.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-light text-white/60 mt-1">04</span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                      Artist Matching & Scheduling
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                      Once your design is finalized, we match you with an artist whose expertise 
                      aligns with your chosen style. We consider their portfolio, specialization, 
                      and availability to ensure the perfect fit. You'll receive detailed information 
                      about your artist and can schedule your session at a time that works for you.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-light text-white/60 mt-1">05</span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                      The Experience & Aftercare
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                      On the day of your appointment, you'll work directly with your artist in a 
                      professional, sterile environment. After your tattoo is complete, we provide 
                      comprehensive aftercare instructions and support to ensure your new art heals 
                      beautifully and maintains its quality for years to come.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Artists Section */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black uppercase tracking-[0.15em]">
                Our Artists
              </h2>
              <div className="w-24 h-px bg-black/20 mx-auto"></div>
            </div>
            <div className="space-y-8">
              <p className="text-base sm:text-lg text-black/70 leading-relaxed font-light text-center max-w-3xl mx-auto">
                We work exclusively with master tattoo artists who have demonstrated exceptional 
                skill, artistic vision, and professional integrity. Our rigorous selection process 
                ensures that every artist in our network meets the highest standards of technical 
                ability, creativity, and client care. Whether creating ready-made designs (€500 - €2,000) 
                or custom masterpieces (€50 - €100,000), our artists deliver exceptional quality.
              </p>
              <div className="grid md:grid-cols-3 gap-8 pt-8">
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                    Expertise
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed font-light">
                    Years of professional experience across diverse styles and techniques, from 
                    traditional to hyperrealism, geometric to watercolor.
                  </p>
                </div>
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                    Professionalism
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed font-light">
                    Licensed, insured, and committed to maintaining the highest standards of 
                    hygiene, safety, and client communication.
                  </p>
                </div>
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                    Passion
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed font-light">
                    Genuine love for the art form and dedication to creating meaningful, 
                    beautiful work that clients will cherish for a lifetime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="border-b border-black/10 bg-black text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">
                Why Choose Tattoo Discovery
              </h2>
              <div className="w-24 h-px bg-white/30 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Comprehensive Options
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  Unlike platforms that push you toward one solution, we present all available 
                  paths with equal respect. Whether you choose ready-made or custom, you'll 
                  make an informed decision based on complete information.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Curated Quality
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  Every design in our gallery has been carefully selected for artistic merit, 
                  technical quality, and timeless appeal. We don't overwhelm you with options— 
                  we present only the best.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Master Artist Network
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  Our custom path connects you with truly exceptional artists. These aren't 
                  beginners or hobbyists—they're established professionals with proven track 
                  records of creating stunning, meaningful work.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Personalized Guidance
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  From your first consultation through aftercare, you'll have dedicated support. 
                  We're here to answer questions, address concerns, and ensure you feel confident 
                  and comfortable throughout your journey.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Transparent Pricing
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  No hidden fees, no surprise charges. You'll know exactly what each option costs 
                  upfront: ready-made tattoos range from €500 to €2,000, while custom creations 
                  span from €50 to €100,000. This transparency allows you to make decisions based 
                  on complete information rather than discovering costs later in the process.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white uppercase tracking-[0.1em]">
                  Safety & Hygiene
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  Every artist in our network adheres to strict health and safety protocols. 
                  Sterile equipment, proper licensing, and professional standards are non-negotiable 
                  requirements for all our partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black uppercase tracking-[0.15em]">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-px bg-black/20 mx-auto"></div>
            </div>
            <div className="space-y-8">
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  What's the difference between ready-made and custom tattoos?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Ready-made tattoos are pre-existing designs from our curated gallery. They're 
                  proven designs that may be shared by others, offering accessibility and 
                  immediate availability. Custom tattoos are bespoke creations designed exclusively 
                  for you by master artists, infused with personal meaning and unique artistic vision. 
                  Both paths are valid and beautiful—the choice depends on your preferences, timeline, 
                  and budget.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  How long does the custom design process take?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  The timeline varies based on complexity, artist availability, and revision rounds. 
                  Typically, initial concepts are delivered within 1-2 weeks, with additional time 
                  for revisions and refinements. We'll provide a specific timeline during your 
                  consultation based on your project's scope.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  Can I modify a ready-made design?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Yes, many ready-made designs can be customized to better suit your vision. 
                  During your consultation, we'll discuss modification options and whether 
                  adjustments are possible for your chosen design. Some modifications may require 
                  transitioning to a custom path.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  How are artists selected and vetted?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Our artist selection process is rigorous. We evaluate portfolios for technical 
                  skill, artistic vision, and consistency. We verify licensing, insurance, and 
                  health certifications. We also consider client testimonials and professional 
                  reputation. Only artists who meet our high standards join our network.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  What if I'm not satisfied with my custom design?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  We include multiple revision rounds in the custom design process to ensure 
                  your complete satisfaction. Your artist will work with you to refine the design 
                  until it perfectly captures your vision. We're committed to creating something 
                  you'll love before any tattooing begins.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  Do you provide aftercare support?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Absolutely. Aftercare is crucial for proper healing and long-term tattoo quality. 
                  We provide comprehensive aftercare instructions tailored to your specific tattoo, 
                  and we're available to answer questions throughout the healing process.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  What styles do your artists specialize in?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Our artist network covers virtually every tattoo style: traditional, neo-traditional, 
                  realism, hyperrealism, watercolor, geometric, blackwork, fine line, Japanese, 
                  tribal, and more. During your consultation, we'll match you with an artist whose 
                  expertise aligns with your desired style.
                </p>
              </div>
              <div className="space-y-3 border-b border-black/10 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  What are the pricing ranges?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Ready-made tattoos from our curated gallery range from €500 to €2,000, offering 
                  accessible options for established designs. Custom tattoos span a wide range from 
                  €50 to €100,000, depending on factors such as size, complexity, detail level, 
                  artist reputation, and session duration. During your consultation, we'll provide 
                  a specific quote based on your chosen path and design requirements.
                </p>
              </div>
              <div className="space-y-3 pb-6">
                <h3 className="text-lg font-light text-black uppercase tracking-[0.1em]">
                  How do I get started?
                </h3>
                <p className="text-sm sm:text-base text-black/60 leading-relaxed font-light">
                  Simply begin your consultation through our platform. We'll guide you through 
                  understanding your options, answering your questions, and helping you choose 
                  the path that best suits your vision, timeline, and budget. The journey starts 
                  with a conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Split Screen Design */}
      <main className="min-h-[calc(100vh-300px)] relative">
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-300px)]">
          {/* Left Side - Ready-Made Tattoos */}
          <div className="border-r border-black/10 flex flex-col justify-center items-center p-12 sm:p-16 md:p-24 bg-white relative">
            <div className="max-w-md space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black/40 uppercase tracking-[0.15em] leading-tight">
                  Ready-Made
                </h2>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-black/30 uppercase tracking-[0.1em]">
                  Tattoos
                </h3>
              </div>
              <div className="pt-8">
                <div className="w-24 h-px bg-black/10 mx-auto mb-8"></div>
                <p className="text-sm sm:text-base text-black/50 leading-relaxed font-light">
                  Pre-existing designs available from standard galleries.
                  <br />
                  Accessible templates that may be shared by others.
                  <br />
                  A practical option for those seeking established designs.
                  <br />
                  <br />
                  <span className="font-medium">Pricing: €500 - €2,000</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Custom Artwork */}
          <div className="flex flex-col justify-center items-center p-12 sm:p-16 md:p-24 bg-black text-white relative">
            <div className="max-w-md space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] leading-tight">
                  Lavish Spreads
                </h2>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-white/90 uppercase tracking-[0.1em]">
                  On Your Body
                </h3>
                <p className="text-base sm:text-lg font-light text-white/70 uppercase tracking-[0.2em] pt-2">
                  Designed by artists of the highest caliber
                </p>
              </div>
              <div className="pt-8">
                <div className="w-24 h-px bg-white/20 mx-auto mb-8"></div>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                  Bespoke designs conceived exclusively for you.
                  <br />
                  Crafted with care by master artists of exceptional talent.
                  <br />
                  Infused with personal meaning and artistic integrity.
                  <br />
                  <br />
                  <span className="font-medium">Pricing: €50 - €100,000</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Divider - OR (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white border-2 border-black rounded-full px-8 py-4">
            <span className="text-lg font-light text-black uppercase tracking-[0.3em]">
              OR
            </span>
          </div>
        </div>

        {/* Mobile OR Divider */}
        <div className="md:hidden border-t border-b border-black/10 bg-white py-8">
          <div className="text-center">
            <span className="text-lg font-light text-black uppercase tracking-[0.3em]">
              OR
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-black/10 bg-white py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <p className="text-lg sm:text-xl text-black/70 leading-relaxed font-light mb-4">
                We invite you to explore both paths and discover which resonates most deeply with your personal vision.
              </p>
              <div className="pt-6">
                {!user && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                  >
                    Begin Your Consultation
                  </button>
                )}
                {user && (
                  <Link
                    href="/beginners"
                    className="inline-block rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
                  >
                    Begin Your Consultation
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <p className="text-xs text-black/30 uppercase tracking-[0.15em]">
            Tattoo Compass
          </p>
        </div>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
