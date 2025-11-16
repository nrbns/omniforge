'use client';

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import confetti from 'canvas-confetti';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

// Enhanced 3-step wizard: Idea → Build → Share
const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🎉 Welcome to OmniForge!</h3>
        <p>Build your app from idea to deployment in minutes. Let's get started!</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.idea-input, [data-testid="new-idea-button"], button:has-text("New Idea")',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Step 1: Share Your Idea 🎯</h3>
        <p>Paste your app idea here—AI will parse it instantly and generate a full spec!</p>
        <p className="text-sm text-gray-600 mt-2">Example: "Build a todo app with add, edit, delete"</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.build-btn, button:has-text("Build"), button:has-text("Generate")',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Step 2: Build Your App 🚀</h3>
        <p>One-click build generates full-stack code (Next.js + NestJS) with real-time collaboration.</p>
        <p className="text-sm text-gray-600 mt-2">Watch AI agents work: Planner → UI → Frontend → Backend</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.deploy-btn, button:has-text("Deploy"), button:has-text("Share")',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Step 3: Share & Deploy 🌐</h3>
        <p>Deploy to Vercel, share preview links, or generate native apps—all in one flow!</p>
        <p className="text-sm text-gray-600 mt-2">🎊 First deploy? We'll celebrate with confetti!</p>
      </div>
    ),
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
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    // Show confetti on completion
    if (status === STATUS.FINISHED) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

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

