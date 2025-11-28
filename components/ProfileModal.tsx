'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, deleteFilterSet, getUserGeneratedTattoos, GeneratedTattoo } from '@/lib/firestore';
import { FilterSet, UserPreferences } from '@/types';
import { FilterOptions } from './FilterBar';
import { GenerateTattooModal } from './GenerateTattooModal';
import Image from 'next/image';

interface ProfileModalProps {
  onClose: () => void;
  onApplyFilters?: (filterSet: FilterSet) => void;
  showWelcomeMessage?: boolean;
}

export function ProfileModal({ onClose, onApplyFilters, showWelcomeMessage = false }: ProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filterSets, setFilterSets] = useState<FilterSet[]>([]);
  const [generatedTattoos, setGeneratedTattoos] = useState<GeneratedTattoo[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingForFilterSet, setGeneratingForFilterSet] = useState<FilterSet | null>(null);
  const [activeTab, setActiveTab] = useState<'filters' | 'tattoos'>('filters');
  const [selectedTattoo, setSelectedTattoo] = useState<GeneratedTattoo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          // Load filter sets
          const preferences = await getUserPreferences(user.uid);
          if (preferences && preferences.filterSets) {
            setFilterSets(preferences.filterSets);
          }
          
          // Load generated tattoos
          const tattoos = await getUserGeneratedTattoos(user.uid);
          setGeneratedTattoos(tattoos);
        } catch (err) {
          console.error('Error loading data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Prevent body scroll when large image modal is open
  useEffect(() => {
    if (selectedTattoo) {
      // Store current scroll position
      const scrollY = window.scrollY;
      // Prevent body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedTattoo]);

  const handleDelete = async (filterSetId: string) => {
    if (!user?.uid) return;
    
    if (!confirm('Are you sure you want to delete this filter set?')) {
      return;
    }

    setDeletingId(filterSetId);
    try {
      await deleteFilterSet(user.uid, filterSetId);
      setFilterSets(prev => prev.filter(fs => fs.id !== filterSetId));
    } catch (err) {
      console.error('Error deleting filter set:', err);
      alert('Failed to delete filter set. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = (filterSet: FilterSet) => {
    if (onApplyFilters) {
      onApplyFilters(filterSet);
    }
    onClose();
  };

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
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-black/20 bg-white p-6 sm:p-8 md:p-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="mb-6 ml-auto block text-black/40 hover:text-black active:text-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-black/10">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'filters'
                ? 'text-black border-b-2 border-black'
                : 'text-black/50 hover:text-black/70'
            }`}
          >
            Filter Sets ({filterSets.length})
          </button>
          <button
            onClick={() => setActiveTab('tattoos')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tattoos'
                ? 'text-black border-b-2 border-black'
                : 'text-black/50 hover:text-black/70'
            }`}
          >
            Generated Tattoos ({generatedTattoos.length})
          </button>
        </div>

        {/* Filter Sets Tab */}
        {activeTab === 'filters' && (
          <>
            {filterSets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-black/50 tracking-wide mb-4">
              No saved filter sets yet
            </p>
            <p className="text-xs text-black/40 tracking-wide">
              Complete the beginners questionnaire to save your first filter set
            </p>
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
                      onClick={() => handleApply(filterSet)}
                      className="rounded-full border border-black/20 px-5 py-2.5 text-xs font-medium text-black/60 transition-all duration-200 hover:border-black/40 hover:text-black active:bg-black/5 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation whitespace-nowrap"
                    >
                      Apply
                    </button>
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
                    <button
                      onClick={() => handleDelete(filterSet.id)}
                      disabled={deletingId === filterSet.id}
                      className="rounded-full border border-black/20 px-5 py-2.5 text-xs font-medium text-black/60 transition-all duration-200 hover:border-black/40 hover:text-black active:bg-black/5 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation whitespace-nowrap disabled:opacity-50"
                    >
                      {deletingId === filterSet.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Generated Tattoos Tab */}
        {activeTab === 'tattoos' && (
          <>
            {generatedTattoos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-black/50 tracking-wide mb-4">
                  No generated tattoos yet
                </p>
                <p className="text-xs text-black/40 tracking-wide">
                  Generate tattoos using your saved filter sets
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {generatedTattoos.map((tattoo) => (
                  <div
                    key={tattoo.id}
                    onClick={() => {
                      setSelectedTattoo(tattoo);
                    }}
                    className="group relative aspect-square overflow-hidden bg-black border border-black/10 hover:border-black/30 transition-colors cursor-pointer"
                  >
                    <Image
                      src={tattoo.imageUrl}
                      alt={tattoo.subjectMatter || 'Generated tattoo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-medium truncate">
                          {tattoo.subjectMatter}
                        </p>
                        {tattoo.filterSetName && (
                          <p className="text-white/70 text-xs truncate mt-1">
                            {tattoo.filterSetName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-10 pt-8 border-t border-black/10">
          <button
            onClick={onClose}
            className="w-full rounded-full border border-black px-6 py-3.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>

      {generatingForFilterSet && (
        <GenerateTattooModal
          filterSet={generatingForFilterSet}
          onClose={() => {
            setGeneratingForFilterSet(null);
            // Refresh generated tattoos when modal closes (in case a new one was saved)
            if (user?.uid) {
              getUserGeneratedTattoos(user.uid).then(setGeneratedTattoos).catch(console.error);
            }
          }}
          onSuccess={(imageUrl) => {
            // Keep the modal open so the user can view/download the image.
            console.log('Tattoo generated successfully:', imageUrl);
            // Refresh generated tattoos list
            if (user?.uid) {
              getUserGeneratedTattoos(user.uid).then(setGeneratedTattoos).catch(console.error);
            }
          }}
        />
      )}

      {/* Large Image Modal */}
      {selectedTattoo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedTattoo(null)}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTattoo(null)}
              className="absolute top-4 right-4 z-10 bg-black/80 text-white rounded-full p-3 hover:bg-black transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full flex flex-col items-center justify-center pb-20">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={selectedTattoo.imageUrl}
                  alt={selectedTattoo.subjectMatter || 'Generated tattoo'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {(selectedTattoo.subjectMatter || selectedTattoo.filterSetName) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 text-white">
                  {selectedTattoo.subjectMatter && (
                    <p className="text-sm font-medium mb-1">
                      {selectedTattoo.subjectMatter}
                    </p>
                  )}
                  {selectedTattoo.filterSetName && (
                    <p className="text-xs text-white/70">
                      {selectedTattoo.filterSetName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

