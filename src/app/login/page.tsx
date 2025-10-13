'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
// --- THIS IS THE FIX (Part 1) ---
// We now import our new, modern client-side helper.
import { createClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from '@/components/shared/Logo';
import BrandName from '@/components/shared/BrandName';
import Link from 'next/link';
import LegalModal from '@/components/shared/LegalModal';

/**
 * This is the login page. Its primary job is to trigger the Google OAuth flow.
 * It has been upgraded to use the modern '@supabase/ssr' client.
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showLegal, setShowLegal] = useState<null | 'terms' | 'privacy'>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // This checks the URL for any error messages sent back from the callback route.
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // Clear ALL auth-related localStorage/cookies to prevent PKCE conflicts
    try {
      // Clear all Supabase auth storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore if localStorage access fails
    }
    
    const supabase = createClient();
    
    // If feedback=1, pass it through the callback
    const feedbackParam = searchParams.get('feedback');
    const redirectParam = searchParams.get('redirect') || '/';
    let redirectTo = `${location.origin}/auth/callback`;
    if (feedbackParam === '1') {
      redirectTo += `?feedback=1&redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm relative">
        {/* Legal modal */}
        {showLegal && (
          <LegalModal type={showLegal} open={!!showLegal} onOpenChange={(o) => !o && setShowLegal(null)} />
        )}
        <CardHeader className="text-center">
          <Logo className="mx-auto text-3xl mb-2" />
          <CardTitle className="flex items-center justify-center gap-1">Welcome to <BrandName inline /></CardTitle>
          <CardDescription>
            <span className="block font-bold text-base sm:text-lg mt-2">
              You must use your <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">@sastra.ac.in</span> email to sign in
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          <Button onClick={handleGoogleLogin} className="w-full flex items-center justify-center" disabled={loading}>
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : null}
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our{' '} 
            <button type="button" onClick={() => setShowLegal('terms')} className="text-blue-600 hover:underline font-medium">Terms of Service</button> 
            {' '}and{' '} 
            <button type="button" onClick={() => setShowLegal('privacy')} className="text-blue-600 hover:underline font-medium">Privacy Policy</button>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

