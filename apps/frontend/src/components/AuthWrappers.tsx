'use client';

import React from 'react';
import {
  DemoSignedIn,
  DemoSignedOut,
  DemoUserButton,
} from './DemoAuthProvider';

// In demo mode, we only use demo auth components
// Simplified to avoid any Clerk imports when not needed
export function ConditionalSignedIn({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoSignedIn>{children}</DemoSignedIn>;
}

export function ConditionalSignedOut({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoSignedOut>{children}</DemoSignedOut>;
}

export function ConditionalUserButton() {
  return <DemoUserButton />;
}

// Re-export the conditional user hook
export { useConditionalUser } from './ConditionalUserHook';

