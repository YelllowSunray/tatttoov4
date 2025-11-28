import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Artist, Tattoo, UserLike, Inquiry, ArtistStats, UserPreferences, FilterSet } from '@/types';

// Collection names
const ARTISTS_COLLECTION = 'artists';
const TATTOOS_COLLECTION = 'tattoos';
const GENERATED_TATTOOS_COLLECTION = 'generated_tattoos';
const LIKES_COLLECTION = 'likes';
const INQUIRIES_COLLECTION = 'inquiries';
const ARTIST_STATS_COLLECTION = 'artist_stats';
const USER_PREFERENCES_COLLECTION = 'user_preferences';
const GENERATION_USAGE_COLLECTION = 'generation_usage';

// Get all artists
export async function getArtists(): Promise<Artist[]> {
  const snapshot = await getDocs(collection(db, ARTISTS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
}

// Get artist by ID
export async function getArtist(artistId: string): Promise<Artist | null> {
  const docRef = doc(db, ARTISTS_COLLECTION, artistId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Artist;
  }
  return null;
}

// Get all tattoos
export async function getTattoos(): Promise<Tattoo[]> {
  const snapshot = await getDocs(collection(db, TATTOOS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tattoo));
}

// Get tattoo by ID
export async function getTattoo(tattooId: string): Promise<Tattoo | null> {
  const docRef = doc(db, TATTOOS_COLLECTION, tattooId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Tattoo;
  }
  return null;
}

// Get tattoos by artist
export async function getTattoosByArtist(artistId: string): Promise<Tattoo[]> {
  const q = query(collection(db, TATTOOS_COLLECTION), where('artistId', '==', artistId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tattoo));
}

// Get user likes (using localStorage user ID for simplicity)
export async function getUserLikes(userId: string): Promise<UserLike[]> {
  const docRef = doc(db, LIKES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().likes || [];
  }
  return [];
}

// Add or remove a like
export async function toggleLike(userId: string, tattooId: string): Promise<boolean> {
  const docRef = doc(db, LIKES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  const currentLikes: UserLike[] = docSnap.exists() ? docSnap.data().likes || [] : [];
  const isLiked = currentLikes.some(like => like.tattooId === tattooId);
  
  let updatedLikes: UserLike[];
  if (isLiked) {
    // Remove like
    updatedLikes = currentLikes.filter(like => like.tattooId !== tattooId);
  } else {
    // Add like
    updatedLikes = [...currentLikes, { tattooId, timestamp: Date.now() }];
  }
  
  await setDoc(docRef, {
    likes: updatedLikes,
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  return !isLiked;
}

// Check if a tattoo is liked
export async function isTattooLiked(userId: string, tattooId: string): Promise<boolean> {
  const likes = await getUserLikes(userId);
  return likes.some(like => like.tattooId === tattooId);
}

// Clear all likes for a user
export async function clearUserLikes(userId: string): Promise<void> {
  const docRef = doc(db, LIKES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return;
  }
  await deleteDoc(docRef);
}

// Create a new inquiry and increment consultation stats
export async function createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = doc(collection(db, INQUIRIES_COLLECTION));
  await setDoc(docRef, {
    ...inquiry,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Increment consultationRequests metric for the artist
  if (inquiry.artistId) {
    const statsRef = doc(db, ARTIST_STATS_COLLECTION, inquiry.artistId);
    await setDoc(
      statsRef,
      {
        artistId: inquiry.artistId,
        consultationRequests: increment(1),
        updatedAt: serverTimestamp(),
        // createdAt is set on first write only
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return docRef.id;
}

// Get inquiries by artist (for artist dashboard)
export async function getInquiriesByArtist(artistId: string): Promise<Inquiry[]> {
  const q = query(collection(db, INQUIRIES_COLLECTION), where('artistId', '==', artistId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
}

// Increment phone click metric for an artist
export async function trackArtistPhoneClick(artistId: string): Promise<void> {
  if (!artistId) return;
  const statsRef = doc(db, ARTIST_STATS_COLLECTION, artistId);
  await setDoc(
    statsRef,
    {
      artistId,
      phoneClicks: increment(1),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// Get stats for a single artist (for admin analytics)
export async function getArtistStats(artistId: string): Promise<ArtistStats | null> {
  const statsRef = doc(db, ARTIST_STATS_COLLECTION, artistId);
  const statsSnap = await getDoc(statsRef);
  if (!statsSnap.exists()) return null;
  return { artistId, ...(statsSnap.data() as Omit<ArtistStats, 'artistId'>) };
}

// Save user preferences (with multiple filter sets)
export async function saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    // Update existing preferences
    await updateDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new preferences
    await setDoc(docRef, {
      ...preferences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// Get user preferences
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserPreferences;
  }
  return null;
}

// Add a new filter set to user preferences
export async function addFilterSet(userId: string, filterSet: Omit<FilterSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  // Generate a unique ID
  const filterSetId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newFilterSet: FilterSet = {
    ...filterSet,
    id: filterSetId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  if (docSnap.exists()) {
    const currentData = docSnap.data() as UserPreferences;
    const updatedFilterSets = [...(currentData.filterSets || []), newFilterSet];
    await updateDoc(docRef, {
      filterSets: updatedFilterSets,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      filterSets: [newFilterSet],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  
  return filterSetId;
}

// Delete a filter set from user preferences
export async function deleteFilterSet(userId: string, filterSetId: string): Promise<void> {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentData = docSnap.data() as UserPreferences;
    const updatedFilterSets = (currentData.filterSets || []).filter(fs => fs.id !== filterSetId);
    await updateDoc(docRef, {
      filterSets: updatedFilterSets,
      updatedAt: serverTimestamp(),
    });
  }
}

// ===== EMAIL-BASED FUNCTIONS (for users without accounts) =====

// Get user preferences by email
export async function getUserPreferencesByEmail(email: string): Promise<UserPreferences | null> {
  try {
    // Use email as document ID (normalize to lowercase for consistency)
    const emailId = `email_${email.toLowerCase().trim()}`;
    console.log('Fetching preferences for email ID:', emailId);
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, emailId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserPreferences;
      console.log('Found preferences in Firebase:', data);
      return data;
    } else {
      console.log('No document found for email ID:', emailId);
    }
    return null;
  } catch (error) {
    console.error('Error getting user preferences by email:', error);
    throw error;
  }
}

// Add a new filter set to user preferences by email
export async function addFilterSetByEmail(email: string, filterSet: Omit<FilterSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const emailId = `email_${email.toLowerCase().trim()}`;
    console.log('Saving filter set for email ID:', emailId);
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, emailId);
    const docSnap = await getDoc(docRef);
    
    // Generate a unique ID
    const filterSetId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFilterSet: FilterSet = {
      ...filterSet,
      id: filterSetId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    console.log('New filter set to save:', newFilterSet);
    
    if (docSnap.exists()) {
      console.log('Document exists, updating...');
      const currentData = docSnap.data() as UserPreferences;
      const updatedFilterSets = [...(currentData.filterSets || []), newFilterSet];
      await updateDoc(docRef, {
        filterSets: updatedFilterSets,
        email: email.toLowerCase().trim(), // Ensure email field is preserved on updates
        updatedAt: serverTimestamp(),
      });
      console.log('Document updated successfully');
    } else {
      console.log('Document does not exist, creating new...');
      await setDoc(docRef, {
        filterSets: [newFilterSet],
        email: email.toLowerCase().trim(), // Store email for reference
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Document created successfully');
    }
    
    return filterSetId;
  } catch (error) {
    console.error('Error adding filter set by email:', error);
    throw error;
  }
}

// Save user preferences by email
export async function saveUserPreferencesByEmail(email: string, preferences: UserPreferences): Promise<void> {
  const emailId = `email_${email.toLowerCase().trim()}`;
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, emailId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    // Update existing preferences
    await updateDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new preferences
    await setDoc(docRef, {
      ...preferences,
      email: email.toLowerCase().trim(), // Store email for reference
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// Delete a filter set from user preferences by email
export async function deleteFilterSetByEmail(email: string, filterSetId: string): Promise<void> {
  try {
    const emailId = `email_${email.toLowerCase().trim()}`;
    console.log('Deleting filter set for email ID:', emailId, 'filterSetId:', filterSetId);
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, emailId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data() as UserPreferences;
      const updatedFilterSets = (currentData.filterSets || []).filter(fs => fs.id !== filterSetId);
      await updateDoc(docRef, {
        filterSets: updatedFilterSets,
        email: email.toLowerCase().trim(), // Ensure email field is preserved
        updatedAt: serverTimestamp(),
      });
      console.log('Filter set deleted successfully');
    } else {
      console.log('Document does not exist for email ID:', emailId);
    }
  } catch (error) {
    console.error('Error deleting filter set by email:', error);
    throw error;
  }
}

// Save a generated tattoo
export interface GeneratedTattoo {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  subjectMatter: string;
  filterSetId?: string;
  filterSetName?: string;
  styles?: string[];
  sizePreference?: string;
  colorPreference?: string;
  bodyParts?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export async function saveGeneratedTattoo(
  userId: string,
  data: {
    imageUrl: string;
    prompt: string;
    subjectMatter: string;
    filterSetId?: string;
    filterSetName?: string;
    styles?: string[];
    sizePreference?: string;
    colorPreference?: string;
    bodyParts?: string[];
  }
): Promise<string> {
  const docRef = doc(collection(db, GENERATED_TATTOOS_COLLECTION));
  await setDoc(docRef, {
    userId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get all generated tattoos for a user, ordered by newest first
export async function getUserGeneratedTattoos(userId: string): Promise<GeneratedTattoo[]> {
  const q = query(
    collection(db, GENERATED_TATTOOS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratedTattoo));
}

// Generation usage tracking
export interface GenerationUsage {
  userId?: string;
  email?: string;
  generationCount: number;
  maxGenerations: number;
  hasPaid: boolean;
  paymentDate?: number;
  lastGenerationDate?: number;
  createdAt?: number;
  updatedAt?: number;
}

// Get generation usage by userId
export async function getGenerationUsage(userId: string): Promise<GenerationUsage | null> {
  const docRef = doc(db, GENERATION_USAGE_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data() } as GenerationUsage;
  }
  return null;
}

// Get generation usage by email
export async function getGenerationUsageByEmail(email: string): Promise<GenerationUsage | null> {
  const emailId = `email_${email.toLowerCase().trim()}`;
  const docRef = doc(db, GENERATION_USAGE_COLLECTION, emailId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data() } as GenerationUsage;
  }
  return null;
}

// Check if user can generate (has paid and hasn't exceeded limit)
export async function canGenerate(userId?: string, email?: string): Promise<{ canGenerate: boolean; reason?: string; usage?: GenerationUsage }> {
  let usage: GenerationUsage | null = null;
  
  if (userId) {
    usage = await getGenerationUsage(userId);
  } else if (email) {
    usage = await getGenerationUsageByEmail(email);
  }
  
  if (!usage) {
    return { canGenerate: false, reason: 'No payment record found. Please complete payment first.' };
  }
  
  if (!usage.hasPaid) {
    return { canGenerate: false, reason: 'Payment not verified. Please complete payment first.', usage };
  }
  
  if (usage.generationCount >= usage.maxGenerations) {
    return { canGenerate: false, reason: 'Generation limit reached. You have already used your one-time generation right.', usage };
  }
  
  return { canGenerate: true, usage };
}

// Initialize generation usage after payment (1 generation allowed)
export async function initializeGenerationUsage(userId?: string, email?: string): Promise<void> {
  const docId = userId || (email ? `email_${email.toLowerCase().trim()}` : null);
  if (!docId) {
    throw new Error('Either userId or email is required');
  }
  
  const docRef = doc(db, GENERATION_USAGE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);
  
  const usageData: Partial<GenerationUsage> = {
    hasPaid: true,
    paymentDate: Date.now(),
    generationCount: 0,
    maxGenerations: 1,
    updatedAt: Date.now(),
  };
  
  if (userId) {
    usageData.userId = userId;
  }
  if (email) {
    usageData.email = email.toLowerCase().trim();
  }
  
  if (docSnap.exists()) {
    // Update existing record (mark as paid if not already)
    await updateDoc(docRef, {
      ...usageData,
      updatedAt: Date.now(),
    });
  } else {
    // Create new record
    await setDoc(docRef, {
      ...usageData,
      createdAt: Date.now(),
    });
  }
}

// Increment generation count after successful generation
export async function incrementGenerationCount(userId?: string, email?: string): Promise<void> {
  const docId = userId || (email ? `email_${email.toLowerCase().trim()}` : null);
  if (!docId) {
    throw new Error('Either userId or email is required');
  }
  
  const docRef = doc(db, GENERATION_USAGE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Generation usage record not found. Cannot increment count.');
  }
  
  await updateDoc(docRef, {
    generationCount: increment(1),
    lastGenerationDate: Date.now(),
    updatedAt: Date.now(),
  });
}
