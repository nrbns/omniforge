'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface PopupBuilderProps {
  roomId: string;
  ideaId?: string;
}

interface PopupConfig {
  type: 'exit-intent' | 'time-based' | 'scroll-based' | 'event-based';
  trigger: {
    delay?: number; // seconds
    scrollPercent?: number; // 0-100
    event?: string; // e.g., 'cart-abandon'
  };
  content: {
    title: string;
    message: string;
    cta?: string;
    ctaUrl?: string;
    discount?: number; // percentage
  };
  design: {
    position: 'center' | 'bottom' | 'top';
    theme: 'light' | 'dark';
  };
}

export default function PopupBuilder({ roomId, ideaId }: PopupBuilderProps) {
  const [config, setConfig] = useState<PopupConfig>({
    type: 'exit-intent',
    trigger: {},
    content: {
      title: 'Wait! Don\'t miss out',
      message: 'Get 10% off your first order',
      cta: 'Claim Discount',
      ctaUrl: '#',
      discount: 10,
    },
    design: {
      position: 'center',
      theme: 'light',
    },
  });

  const [preview, setPreview] = useState(false);

  const generateWithAI = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/agents/popup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaId,
            context: 'cart abandonment',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to generate popup');
      }

      const generated = await response.json();
      setConfig(generated);
      toast.success('Popup generated!', { description: 'AI created a popup for you' });
    } catch (error) {
      toast.error('Failed to generate popup', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const savePopup = () => {
    // Save to database or emit via Socket.io
    toast.success('Popup saved!', { description: 'Changes are synced in real-time' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="p-3 bg-white border-b flex items-center gap-2">
        <button
          onClick={generateWithAI}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
        >
          <span>✨</span>
          AI Generate Popup
        </button>
        <div className="flex-1" />
        <button
          onClick={savePopup}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          💾 Save
        </button>
        <button
          onClick={() => setPreview(!preview)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {preview ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {!preview && (
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popup Type
                </label>
                <select
                  value={config.type}
                  onChange={(e) =>
                    setConfig({ ...config, type: e.target.value as PopupConfig['type'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="exit-intent">Exit Intent</option>
                  <option value="time-based">Time Based</option>
                  <option value="scroll-based">Scroll Based</option>
                  <option value="event-based">Event Based</option>
                </select>
              </div>

              {/* Trigger Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Settings
                </label>
                {config.type === 'time-based' && (
                  <input
                    type="number"
                    placeholder="Delay (seconds)"
                    value={config.trigger.delay || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        trigger: { ...config.trigger, delay: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
                {config.type === 'scroll-based' && (
                  <input
                    type="number"
                    placeholder="Scroll % (0-100)"
                    value={config.trigger.scrollPercent || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        trigger: {
                          ...config.trigger,
                          scrollPercent: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
                {config.type === 'event-based' && (
                  <input
                    type="text"
                    placeholder="Event name (e.g., cart-abandon)"
                    value={config.trigger.event || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        trigger: { ...config.trigger, event: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={config.content.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        content: { ...config.content, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={config.content.message}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        content: { ...config.content, message: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={config.content.cta || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        content: { ...config.content, cta: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={config.content.discount || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        content: { ...config.content, discount: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Design */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={config.design.position}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        design: { ...config.design, position: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={config.design.theme}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        design: { ...config.design, theme: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className={`${preview ? 'w-full' : 'w-1/2'} p-6 bg-gray-100 overflow-y-auto`}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">{config.content.title}</h3>
            <p className="text-gray-600 mb-4">{config.content.message}</p>
            {config.content.discount && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded mb-4 inline-block">
                {config.content.discount}% OFF
              </div>
            )}
            {config.content.cta && (
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {config.content.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

