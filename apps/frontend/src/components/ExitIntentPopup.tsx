'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExitIntentPopupProps {
  config: {
    title: string;
    message: string;
    cta: string;
    ctaUrl: string;
    discount?: number;
  };
  onClose: () => void;
}

/**
 * Exit Intent Popup Component
 * Detects when user is about to leave the page
 */
export function ExitIntentPopup({ config, onClose }: ExitIntentPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect exit intent (mouse leaving viewport from top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
      }
    };

    // Detect back button
    const handlePopState = () => {
      setShow(true);
    };

    // Detect beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      setShow(true);
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h3 className="text-xl font-bold mb-2">{config.title}</h3>
          <p className="text-gray-600 mb-4">{config.message}</p>

          {config.discount && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded mb-4 inline-block">
              {config.discount}% OFF
            </div>
          )}

          <a
            href={config.ctaUrl}
            className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700"
          >
            {config.cta}
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

