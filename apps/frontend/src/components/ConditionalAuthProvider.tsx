'use client';

import React from 'react';
import { DemoAuthProvider } from './DemoAuthProvider';

// In demo mode (no Clerk key), we only use demo auth
// This avoids any Clerk-related imports or errors
export function ConditionalAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always use demo auth for now
  // When Clerk is configured, we can add conditional logic
  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}
