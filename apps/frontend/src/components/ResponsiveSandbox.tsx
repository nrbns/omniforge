'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveSandboxProps {
  children: React.ReactNode;
  defaultView?: 'split' | 'code' | 'output';
}

/**
 * Responsive Sandbox Container
 * Adapts to mobile/tablet/desktop screens
 */
export function ResponsiveSandbox({ children, defaultView = 'split' }: ResponsiveSandboxProps) {
  const [view, setView] = useState<'split' | 'code' | 'output'>(defaultView);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && view === 'split') {
        setView('code'); // Default to code view on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [view]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Mobile View Toggle */}
        <div className="flex border-b bg-gray-800">
          <button
            onClick={() => setView('code')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              view === 'code'
                ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💻 Code
          </button>
          <button
            onClick={() => setView('output')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              view === 'output'
                ? 'bg-gray-700 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Output
          </button>
        </div>

        {/* Mobile Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === 'code' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'code' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: Split view
  return <div className="flex h-full">{children}</div>;
}

/**
 * Responsive Monaco Editor Wrapper
 */
export function ResponsiveMonacoEditor({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full">
      <ResponsiveSandbox>
        <div className="flex-1 overflow-hidden">{children}</div>
      </ResponsiveSandbox>
    </div>
  );
}

