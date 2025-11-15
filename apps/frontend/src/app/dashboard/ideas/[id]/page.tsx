'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Idea } from '@omniforge/shared';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    fetchIdea();
    // Subscribe to real-time updates
    const eventSource = new EventSource(`http://localhost:3001/api/ideas/${id}/stream`);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'idea.updated' || data.type === 'idea.parsed') {
        setIdea(data.payload);
      }
    };
    return () => eventSource.close();
  }, [id]);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${id}`);
      const data = await response.json();
      setIdea(data);
    } catch (error) {
      console.error('Error fetching idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    setParsing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${id}/parse`, {
        method: 'POST',
      });
      const data = await response.json();
      setIdea(data);
    } catch (error) {
      console.error('Error parsing idea:', error);
    } finally {
      setParsing(false);
    }
  };

  const handleBuild = async () => {
    try {
      // Create project first
      const projectResponse = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: id,
          userId: 'temp', // TODO: Get from auth
          name: idea?.title || 'New Project',
        }),
      });
      const project = await projectResponse.json();

      // Build project
      await fetch(`http://localhost:3001/api/projects/${project.id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      console.error('Error building project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          <div className="flex gap-2">
            {idea.status === 'DRAFT' && (
              <button
                onClick={handleParse}
                disabled={parsing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {parsing ? 'Parsing...' : 'Parse Idea'}
              </button>
            )}
            {idea.status === 'PARSED' && (
              <button
                onClick={handleBuild}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Build Project
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    idea.status === 'PARSED'
                      ? 'bg-green-100 text-green-700'
                      : idea.status === 'BUILDING'
                      ? 'bg-blue-100 text-blue-700'
                      : idea.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {idea.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Branch: <span className="font-mono">{idea.branch}</span>
              </p>
            </div>

            {/* Description */}
            {idea.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
              </div>
            )}

            {/* Raw Input */}
            {idea.rawInput && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Input</h2>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800">
                  {idea.rawInput}
                </pre>
              </div>
            )}

            {/* Spec */}
            {idea.specJson && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specification</h2>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 max-h-96 overflow-y-auto">
                  {JSON.stringify(idea.specJson, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Updated</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(idea.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Create Branch
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  View Commits
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Export Spec
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

