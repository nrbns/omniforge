'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ShowcaseApp {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  screenshot?: string;
  liveUrl?: string;
  githubUrl?: string;
  author: {
    name: string;
    avatar?: string;
  };
  votes: number;
  createdAt: string;
  featured?: boolean;
}

export default function ShowcasePage() {
  const [apps, setApps] = useState<ShowcaseApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShowcaseApps();
  }, []);

  const fetchShowcaseApps = async () => {
    try {
      const response = await fetch('/api/showcase');
      const data = await response.json();
      setApps(data);
    } catch (error) {
      console.error('Error fetching showcase apps:', error);
      // Mock data for demo
      setApps([
        {
          id: '1',
          title: 'E-Commerce Store',
          description: 'Full-featured online store with cart, checkout, and product management',
          category: 'ecommerce',
          tags: ['nextjs', 'stripe', 'ecommerce'],
          liveUrl: 'https://example.com',
          author: { name: 'John Doe' },
          votes: 42,
          createdAt: new Date().toISOString(),
          featured: true,
        },
        {
          id: '2',
          title: 'SaaS Dashboard',
          description: 'Analytics dashboard with user management and settings',
          category: 'saas',
          tags: ['react', 'analytics', 'dashboard'],
          liveUrl: 'https://example.com',
          author: { name: 'Jane Smith' },
          votes: 38,
          createdAt: new Date().toISOString(),
          featured: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', count: apps.length },
    { id: 'ecommerce', name: 'E-Commerce', count: apps.filter(a => a.category === 'ecommerce').length },
    { id: 'saas', name: 'SaaS', count: apps.filter(a => a.category === 'saas').length },
    { id: 'social', name: 'Social', count: apps.filter(a => a.category === 'social').length },
    { id: 'blog', name: 'Blog', count: apps.filter(a => a.category === 'blog').length },
    { id: 'other', name: 'Other', count: apps.filter(a => a.category === 'other').length },
  ];

  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredApps = filteredApps.filter(app => app.featured);
  const regularApps = filteredApps.filter(app => !app.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎨 OmniForge Showcase
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            See what the community is building with AI-powered development
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search apps, tags, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <Link
            href="/showcase/submit"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            ✨ Submit Your App
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading showcase apps...</p>
          </div>
        ) : (
          <>
            {/* Featured Apps */}
            {featuredApps.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">⭐ Featured Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredApps.map(app => (
                    <ShowcaseCard key={app.id} app={app} />
                  ))}
                </div>
              </div>
            )}

            {/* All Apps */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                All Apps ({filteredApps.length})
              </h2>
              {regularApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularApps.map(app => (
                    <ShowcaseCard key={app.id} app={app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-lg mb-4">No apps found matching your criteria</p>
                  <Link
                    href="/showcase/submit"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Be the first to submit!
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ShowcaseCard({ app }: { app: ShowcaseApp }) {
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    if (voted) return;
    
    try {
      const response = await fetch(`/api/showcase/${app.id}/vote`, {
        method: 'POST',
      });
      if (response.ok) {
        setVoted(true);
        toast.success('Vote recorded!');
      }
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Screenshot */}
      <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative">
        {app.screenshot ? (
          <img src={app.screenshot} alt={app.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
            {app.title.charAt(0)}
          </div>
        )}
        {app.featured && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{app.title}</h3>
          <button
            onClick={handleVote}
            disabled={voted}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              voted
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            <span>👍</span>
            <span>{app.votes + (voted ? 1 : 0)}</span>
          </button>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{app.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {app.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {app.author.avatar ? (
                <img src={app.author.avatar} alt={app.author.name} className="w-full h-full rounded-full" />
              ) : (
                <span>{app.author.name.charAt(0)}</span>
              )}
            </div>
            <span>{app.author.name}</span>
          </div>

          <div className="flex gap-2">
            {app.liveUrl && (
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Live Demo
              </a>
            )}
            {app.githubUrl && (
              <a
                href={app.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

