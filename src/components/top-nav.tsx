'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import WalletButton from './dynamic';  // Import the WalletButton component

export function TopNav() {
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

  return (
    <nav className="flex justify-between items-center p-4 bg-background border-b">
      <Link href="/" className="text-xl font-bold">
        Web3 Fiverr
      </Link>
      <div className="flex items-center space-x-4">
        {status === 'authenticated' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                {session.user.id || 'Account'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Verification Level: {session.user.verificationLevel}
              </DropdownMenuItem>
              <DropdownMenuItem>
                Role: {session.user.role}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleSignIn} disabled={isLoading || status === 'loading'}>
            {isLoading ? 'Signing in...' : 'Sign in with World ID'}
          </Button>
        )}
        {/* Add the WalletButton component */}
        <WalletButton />
      </div>
    </nav>
  );
}