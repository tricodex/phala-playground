'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('worldcoin', { callbackUrl: '/flow' });
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
    setIsLoading(false);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Web3 Fiverr Authentication</CardTitle>
          <CardDescription>Sign in with World ID to use the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <Alert>
              <AlertTitle>Authenticated</AlertTitle>
              <AlertDescription>
                You are signed in as {session.user.id}
                <br />
                Verification Level: {session.user.verificationLevel}
              </AlertDescription>
            </Alert>
          ) : (
            <p>You are not signed in.</p>
          )}
        </CardContent>
        <CardFooter>
          {session ? (
            <Button onClick={handleSignOut} disabled={isLoading}>
              {isLoading ? 'Signing out...' : 'Sign out'}
            </Button>
          ) : (
            <Button onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in with World ID'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}