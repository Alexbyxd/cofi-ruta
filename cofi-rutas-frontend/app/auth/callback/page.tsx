'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Auth Callback Page - Better Auth Version
 *
 * Better Auth handles OAuth callbacks automatically at /api/auth/callback/:provider
 * and redirects to the callbackURL specified in signIn.social().
 *
 * This page handles:
 * - Successful OAuth redirect (from Better Auth callbackURL)
 * - Error states (if any)
 * - Email verification links (if enabled in future)
 */

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error parameters from Better Auth
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('[Auth Callback] OAuth error:', { error, errorCode, errorDescription });
      router.replace(`/login?error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    // Check for email verification (if enabled in future)
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      router.replace('/login?verified=true');
      return;
    }

    // Successful OAuth redirect - Better Auth already set cookies
    // Just redirect to dashboard (or intended page)
    const callbackURL = searchParams.get('callbackURL') || '/dashboard';
    router.replace(callbackURL);
  }, [router, searchParams]);

  // Render nothing - this page immediately redirects
  return null;
}

/**
 * Wrapper with Suspense to allow useSearchParams() during static generation
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}