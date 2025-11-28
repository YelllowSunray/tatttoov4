'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, getUserPreferencesByEmail } from '@/lib/firestore';
import { FilterSet, UserPreferences } from '@/types';
import { FilterOptions } from './FilterBar';
import { GenerateTattooModal } from './GenerateTattooModal';
import Link from 'next/link';

interface ProfileModalProps {
  onClose: () => void;
  onApplyFilters?: (filterSet: FilterSet) => void;
  showWelcomeMessage?: boolean;
}

export function ProfileModal({ onClose, onApplyFilters, showWelcomeMessage = false }: ProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filterSets, setFilterSets] = useState<FilterSet[]>([]);
  const [generatingForFilterSet, setGeneratingForFilterSet] = useState<FilterSet | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          // Load filter sets
          const preferences = await getUserPreferences(user.uid);
          if (preferences && preferences.filterSets) {
            setFilterSets(preferences.filterSets);
          }
        } catch (err) {
          console.error('Error loading data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For users without account but who have paid, load from Firebase using email
        try {
          // Get email from payment
          const paymentEmail = typeof window !== 'undefined' 
            ? (sessionStorage.getItem('payment_email') || sessionStorage.getItem('verified_payment_email'))
            : null;
          
          if (paymentEmail) {
            console.log('Loading preferences for email:', paymentEmail);
            // Try to load from Firebase first
            try {
              const preferences = await getUserPreferencesByEmail(paymentEmail);
              console.log('Firebase preferences loaded:', preferences);
              if (preferences && preferences.filterSets && preferences.filterSets.length > 0) {
                console.log('Setting filter sets from Firebase:', preferences.filterSets);
                setFilterSets(preferences.filterSets);
              } else {
                console.log('No Firebase data found, checking localStorage...');
                // Fallback to localStorage if Firebase doesn't have data yet
                const storedPreferences = localStorage.getItem('tattooPreferences');
                if (storedPreferences) {
                  const prefs = JSON.parse(storedPreferences);
                  // Create a temporary filter set from localStorage
                  const tempFilterSet: FilterSet = {
                    id: 'local-' + Date.now(),
                    name: 'My Consultation',
                    styles: prefs.styles || [],
                    bodyParts: prefs.bodyParts || [],
                    colorPreference: prefs.colorPreference || null,
                    sizePreference: prefs.sizePreference || null,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  };
                  console.log('Setting filter sets from localStorage:', tempFilterSet);
                  setFilterSets([tempFilterSet]);
                } else {
                  console.log('No data found in Firebase or localStorage');
                }
              }
            } catch (firebaseError) {
              console.error('Error loading from Firebase:', firebaseError);
              // Fallback to localStorage on Firebase error
              const storedPreferences = localStorage.getItem('tattooPreferences');
              if (storedPreferences) {
                const prefs = JSON.parse(storedPreferences);
                const tempFilterSet: FilterSet = {
                  id: 'local-' + Date.now(),
                  name: 'My Consultation',
                  styles: prefs.styles || [],
                  bodyParts: prefs.bodyParts || [],
                  colorPreference: prefs.colorPreference || null,
                  sizePreference: prefs.sizePreference || null,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                setFilterSets([tempFilterSet]);
              }
            }
          } else {
            console.log('No payment email found in sessionStorage');
            // No email found, try localStorage as last resort
            const storedPreferences = localStorage.getItem('tattooPreferences');
            if (storedPreferences) {
              const prefs = JSON.parse(storedPreferences);
              // Create a temporary filter set from localStorage
              const tempFilterSet: FilterSet = {
                id: 'local-' + Date.now(),
                name: 'My Consultation',
                styles: prefs.styles || [],
                bodyParts: prefs.bodyParts || [],
                colorPreference: prefs.colorPreference || null,
                sizePreference: prefs.sizePreference || null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setFilterSets([tempFilterSet]);
            }
          }
        } catch (err) {
          console.error('Error loading preferences:', err);
          // Fallback to localStorage on error
          try {
            const storedPreferences = localStorage.getItem('tattooPreferences');
            if (storedPreferences) {
              const prefs = JSON.parse(storedPreferences);
              const tempFilterSet: FilterSet = {
                id: 'local-' + Date.now(),
                name: 'My Consultation',
                styles: prefs.styles || [],
                bodyParts: prefs.bodyParts || [],
                colorPreference: prefs.colorPreference || null,
                sizePreference: prefs.sizePreference || null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setFilterSets([tempFilterSet]);
            }
          } catch (localErr) {
            console.error('Error loading localStorage preferences:', localErr);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  // Removed auto-open AI Generator - user should manually click to generate

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl border border-black/20 bg-white p-6 sm:p-8 md:p-10 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-12">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto"></div>
            <p className="text-black/60 text-sm tracking-wide">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        className="w-full max-w-2xl border border-black/20 bg-white p-6 sm:p-8 md:p-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-black">
          Profile
        </h2>

        {/* Welcome Message */}
        {showWelcomeMessage && filterSets.length > 0 && (
          <div className="mb-6 p-4 bg-black/5 border border-black/10 rounded-lg">
            <p className="text-sm text-black/80 mb-2">
              <strong>🎨 Ready to generate your tattoo design?</strong>
            </p>
            <p className="text-xs text-black/60">
              Your preferences have been saved. Click "Generate Tattoo" on any filter set below to create a custom design using AI.
            </p>
          </div>
        )}

        {/* Filter Sets */}
        {filterSets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-black/40 tracking-wide mb-6">
              To make your generated tattoos, please go to your consultation
            </p>
            <Link
              href="/beginners"
              onClick={onClose}
              className="inline-block rounded-full bg-black px-6 py-3 text-xs font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
            >
              Go to your consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filterSets.map((filterSet) => (
              <div
                key={filterSet.id}
                className="border border-black/10 p-4 sm:p-6 hover:border-black/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-light text-black mb-3">
                      {filterSet.name}
                    </h3>
                    <div className="space-y-2 text-sm text-black/50">
                      {filterSet.styles.length > 0 && (
                        <p>
                          <span className="font-medium text-black/60">Styles:</span>{' '}
                          {filterSet.styles.join(', ')}
                        </p>
                      )}
                      {filterSet.bodyParts.length > 0 && (
                        <p>
                          <span className="font-medium text-black/60">Body Parts:</span>{' '}
                          {filterSet.bodyParts.join(', ')}
                        </p>
                      )}
                      {filterSet.colorPreference && (
                        <p>
                          <span className="font-medium text-black/60">Color:</span>{' '}
                          {filterSet.colorPreference === 'both'
                            ? 'Both'
                            : filterSet.colorPreference === 'color'
                            ? 'Color'
                            : 'Black & White'}
                        </p>
                      )}
                      {filterSet.sizePreference && (
                        <p>
                          <span className="font-medium text-black/60">Size:</span>{' '}
                          {filterSet.sizePreference === 'all'
                            ? 'All Sizes'
                            : filterSet.sizePreference.charAt(0).toUpperCase() +
                              filterSet.sizePreference.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setGeneratingForFilterSet(filterSet);
                        // Scroll window to top when opening generate modal
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // Also try scrolling after a short delay to ensure modal is rendered
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="rounded-full bg-black px-5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-black/90 active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation whitespace-nowrap"
                    >
                      Generate Tattoo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {generatingForFilterSet && (
        <GenerateTattooModal
          filterSet={generatingForFilterSet}
          onClose={() => {
            setGeneratingForFilterSet(null);
          }}
          onSuccess={(imageUrl) => {
            // Keep the modal open so the user can view/download the image.
            console.log('Tattoo generated successfully:', imageUrl);
          }}
        />
      )}

    </div>
  );
}

