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
  const searchParams = useSearchParams();

  useEffect(() => {
    // This checks the URL for any error messages sent back from the callback route.
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    // --- THIS IS THE FIX (Part 2) ---
    // We now use our new `createClient` function.
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // The callback URL points to our secure backend route.
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
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
          <CardDescription>The marketplace for your campus</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          <Button onClick={handleGoogleLogin} className="w-full">
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our{' '} 
            <button type="button" onClick={() => setShowLegal('terms')} className="text-blue-600 hover:underline font-medium">Terms of Service</button> 
            {' '}and{' '} 
            <button type="button" onClick={() => setShowLegal('privacy')} className="text-blue-600 hover:underline font-medium">Privacy Policy</button>.
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            You must use your official university email (
            <span className="text-blue-600 font-semibold">@sastra.ac.in</span>
            ).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

