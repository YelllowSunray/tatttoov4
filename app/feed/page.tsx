'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Redirect /feed to homepage, preserving query parameters
  useEffect(() => {
    const queryString = searchParams.toString();
    const redirectUrl = queryString ? `/?${queryString}` : '/';
    router.replace(redirectUrl);
  }, [router, searchParams]);
  
  return null;
}
