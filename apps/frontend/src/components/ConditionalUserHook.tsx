'use client';

import { useDemoAuth } from './DemoAuthProvider';

// In demo mode (no Clerk key configured), we only use demo auth
// This hook will always return demo auth since we're running in demo mode
export function useConditionalUser() {
  // Always use demo auth in demo mode
  // When Clerk is configured, this file should be updated to support Clerk mode
  return useDemoAuth();
}
