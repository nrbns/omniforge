'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartAbandonmentPopupProps {
  config: {
    title: string;
    message: string;
    cta: string;
    ctaUrl: string;
    discount?: number;
    items?: Array<{ name: string; price: number }>;
  };
  onClose: () => void;
  onCompletePurchase: () => void;
}

/**
 * Cart Abandonment Popup
 * Shows when user has items in cart but hasn't completed purchase
 */
export function CartAbandonmentPopup({ config, onClose, onCompletePurchase }: CartAbandonmentPopupProps) {
  const [show, setShow] = useState(false);
  const [timeInCart, setTimeInCart] = useState(0);

  useEffect(() => {
    // Check if cart has items (from localStorage or context)
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length === 0) return;

    // Show popup after 2 minutes of cart inactivity
    const timer = setInterval(() => {
      setTimeInCart((prev) => prev + 1);
      if (timeInCart >= 120) {
        // 2 minutes
        setShow(true);
      }
    }, 1000);

    // Also show on page visibility change (user switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden && cartItems.length > 0) {
        setShow(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeInCart]);

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
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
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

          {config.items && config.items.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Items in your cart:</div>
              <ul className="space-y-1">
                {config.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {item.name} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {config.discount && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded mb-4 inline-block">
              Use code SAVE{config.discount} for {config.discount}% off!
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onCompletePurchase}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {config.cta}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

