'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoUser {
  id: string;
  firstName: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
}

export interface DemoAuthContextType {
  user: DemoUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
});

export function useDemoAuth() {
  return useContext(DemoAuthContext);
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading user
    setTimeout(() => {
      setUser({
        id: 'demo-user-123',
        firstName: 'Demo',
        emailAddresses: [{ emailAddress: 'demo@omniforge.dev' }],
      });
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

// Demo components that mimic Clerk's API
export function DemoSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useDemoAuth();
  if (!isLoaded) return null;
  return isSignedIn ? <>{children}</> : null;
}

export function DemoSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useDemoAuth();
  if (!isLoaded) return null;
  return !isSignedIn ? <>{children}</> : null;
}

export function DemoUserButton() {
  const { user } = useDemoAuth();
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
        {user?.firstName?.[0] || 'D'}
      </div>
      <span className="text-sm text-gray-700">{user?.firstName || 'Demo'}</span>
    </div>
  );
}

