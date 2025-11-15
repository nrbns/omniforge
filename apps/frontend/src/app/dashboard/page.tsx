'use client';

import { useConditionalUser } from '../../components/AuthWrappers';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Idea } from '@omniforge/shared';

export default function DashboardPage() {
  const { user, isLoaded } = useConditionalUser();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchIdeas();
    }
  }, [isLoaded, user]);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ideas?userId=temp');
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            OmniForge
          </Link>
          <div className="text-sm text-gray-600">
            Welcome,{' '}
            {user?.firstName ||
              (user as any)?.emailAddresses?.[0]?.emailAddress ||
              'Demo User'}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <Link
            href="/dashboard/ideas/new"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            New Idea
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-semibold mb-2">No ideas yet</h2>
            <p className="text-gray-600 mb-6">
              Start building by creating your first idea.
            </p>
            <Link
              href="/dashboard/ideas/new"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Idea
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/dashboard/ideas/${idea.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {idea.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    idea.status === 'PARSED' ? 'bg-green-100 text-green-700' :
                    idea.status === 'BUILDING' ? 'bg-blue-100 text-blue-700' :
                    idea.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {idea.status}
                  </span>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

