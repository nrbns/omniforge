'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input, Textarea, Button } from '@omniforge/ui';

export default function NewIdeaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rawInput: '',
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

