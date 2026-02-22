'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input, Textarea, Button } from '@omniforge/ui';

const UI_STYLE_OPTIONS = [
  { id: 'modern-saas', label: 'Modern SaaS', desc: 'Clean, professional', icon: '✨' },
  { id: 'minimal', label: 'Minimal', desc: 'Simple and elegant', icon: '◻️' },
  { id: 'bold-startup', label: 'Bold Startup', desc: 'High contrast, impactful', icon: '🚀' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium, refined', icon: '💎' },
  { id: 'playful', label: 'Playful', desc: 'Fun, vibrant', icon: '🎨' },
  { id: 'dark-first', label: 'Dark Mode', desc: 'Dark theme by default', icon: '🌙' },
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

export default function NewIdeaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rawInput: '',
    uiStyle: 'modern-saas',
    theme: 'light' as 'light' | 'dark' | 'auto',
    layout: 'landing-page',
    interaction: 'clean-static',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp', // TODO: Get from auth
          title: formData.title,
          description: formData.description || undefined,
          rawInput: formData.rawInput || undefined,
          uiPreferences: {
            style: formData.uiStyle,
            theme: formData.theme,
            layout: formData.layout,
            interaction: formData.interaction,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create idea');
      }

      const idea = await response.json();
      router.push(`/dashboard/ideas/${idea.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
      setErrors({ submit: 'Failed to create idea. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Idea</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title"
              placeholder="e.g., A telemedicine app for remote consultations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe your idea in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              error={errors.description}
            />

            <Textarea
              label="Raw Input"
              placeholder="Paste any additional context, requirements, or notes here..."
              value={formData.rawInput}
              onChange={(e) => setFormData({ ...formData, rawInput: e.target.value })}
              rows={6}
              helperText="This can include wireframes, user stories, or any other relevant information"
              error={errors.rawInput}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customize your UI</label>
              <p className="text-sm text-gray-500 mb-3">Choose a style so your app feels personalized</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UI_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, uiStyle: opt.id })}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.uiStyle === opt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <div className="font-medium text-gray-900 text-sm mt-1">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: opt.id })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.theme === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Idea'}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips for better results</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Be specific about features and functionality</li>
            <li>• Mention target users and use cases</li>
            <li>• Include any design preferences or requirements</li>
            <li>• Specify integrations or third-party services needed</li>
            <li>• Add any technical constraints or preferences</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

