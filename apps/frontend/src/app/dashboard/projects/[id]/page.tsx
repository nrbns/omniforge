'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Project, Build } from '@omniforge/shared';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  useEffect(() => {
    fetchProject();
    fetchBuilds();
    // Subscribe to real-time updates
    const eventSource = new EventSource(`http://localhost:3001/api/projects/${id}/stream`);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'project.updated' || data.type === 'build.created') {
        fetchProject();
        fetchBuilds();
      }
    };
    return () => eventSource.close();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`);
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuilds = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/builds?projectId=${id}`);
      const data = await response.json();
      setBuilds(data);
    } catch (error) {
      console.error('Error fetching builds:', error);
    }
  };

  const handleBuild = async () => {
    try {
      await fetch(`http://localhost:3001/api/projects/${id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchBuilds();
    } catch (error) {
      console.error('Error building project:', error);
    }
  };

  const handleDeploy = async (platform: string) => {
    try {
      await fetch('http://localhost:3001/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          userId: 'temp',
          platform,
        }),
      });
      fetchProject();
    } catch (error) {
      console.error('Error deploying project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={handleBuild}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Build
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Deploy
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Builds List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Builds</h2>
                <button
                  onClick={handleBuild}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  New Build
                </button>
              </div>
              <div className="space-y-2">
                {builds.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No builds yet</p>
                ) : (
                  builds.map((build) => (
                    <div
                      key={build.id}
                      onClick={() => setSelectedBuild(build)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedBuild?.id === build.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Build #{build.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {build.createdAt ? new Date(build.createdAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            build.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : build.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : build.status === 'RUNNING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {build.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Build Details */}
            {selectedBuild && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Build Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-base font-medium text-gray-900">{selectedBuild.status}</p>
                  </div>
                  {selectedBuild.logs && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Logs</p>
                      <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs text-gray-800 max-h-96 overflow-y-auto">
                        {selectedBuild.logs}
                      </pre>
                    </div>
                  )}
                  {selectedBuild.error && (
                    <div>
                      <p className="text-sm text-red-500 mb-2">Error</p>
                      <p className="text-sm text-red-700">{selectedBuild.error}</p>
                    </div>
                  )}
                </div>
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
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-900">{project.status}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Builds</dt>
                  <dd className="font-medium text-gray-900">{builds.length}</dd>
                </div>
              </dl>
            </div>

            {/* Deploy Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deploy</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleDeploy('vercel')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Deploy to Vercel
                </button>
                <button
                  onClick={() => handleDeploy('docker')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Deploy to Docker
                </button>
                <button
                  onClick={() => handleDeploy('ios')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Package for iOS
                </button>
                <button
                  onClick={() => handleDeploy('android')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Package for Android
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

