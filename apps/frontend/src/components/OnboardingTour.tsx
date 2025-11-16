'use client';

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

const steps: Step[] = [
  {
    target: '.idea-input',
    content: '🎯 Drop your app dream here—AI parses it instantly and generates a full spec!',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.idea-card',
    content: '💡 Your ideas are stored in the Redix Idea Layer with versioning, branches, and semantic search.',
    placement: 'right',
  },
  {
    target: '.parse-btn',
    content: '✨ Click "Parse Idea" to watch AI agents extract pages, APIs, and data models automatically.',
    placement: 'bottom',
  },
  {
    target: '.build-btn',
    content: '🚀 One-click build generates full-stack code (Next.js + NestJS) with real-time collaboration.',
    placement: 'bottom',
  },
  {
    target: '.realtime-builder-btn',
    content: '👥 Open Realtime Builder for live collaborative editing with Yjs CRDT—no merge conflicts!',
    placement: 'left',
  },
  {
    target: '.agent-panel',
    content: '🤖 Watch multi-agent orchestration: Planner → UI → Frontend → Backend → Deploy. All live!',
    placement: 'top',
  },
  {
    target: '.deploy-btn',
    content: '🌐 Deploy to Vercel, TestFlight, or generate native Tauri/Electron apps—all in one flow.',
    placement: 'bottom',
  },
];

export function OnboardingTour({ run: externalRun, onComplete }: OnboardingTourProps) {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('omniforge-onboarding-seen', false);
  const [run, setRun] = useState(externalRun ?? false);

  useEffect(() => {
    // Auto-start tour if user hasn't seen it and no external control
    if (!externalRun && !hasSeenTour) {
      setRun(true);
    } else if (externalRun !== undefined) {
      setRun(externalRun);
    }
  }, [externalRun, hasSeenTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setHasSeenTour(true);
      setRun(false);
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#7c3aed', // Purple theme
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: 6,
        },
        buttonBack: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

