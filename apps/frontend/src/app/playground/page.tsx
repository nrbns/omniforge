'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PlaygroundPage() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoProjectId, setDemoProjectId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast.error('Please describe your idea');
      return;
    }

    setLoading(true);
    try {
      // Create demo idea
      const ideaResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/ideas`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: idea.substring(0, 50),
            description: idea,
            orgId: 'demo-org', // Demo tenant
            createdBy: 'demo-user',
          }),
        },
      );

      if (!ideaResponse.ok) {
        throw new Error('Failed to create idea');
      }

      const ideaData = await ideaResponse.json();

      // Wait for spec to be generated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get spec
      const specResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/ideas/${ideaData.id}/spec`,
      );
      const spec = await specResponse.ok ? await specResponse.json() : null;

      // Create demo project
      const projectResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId: 'demo-org',
            ideaId: ideaData.id,
            ideaCommitId: ideaData.currentCommitId,
            name: ideaData.title,
            status: 'BUILDING',
          }),
        },
      );

      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }

      const project = await projectResponse.json();
      setDemoProjectId(project.id);

      // Trigger build (lite mode)
      const buildResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${project.id}/build`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lite: true }), // Lite mode for demo
        },
      );

      if (buildResponse.ok) {
        toast.success('Building your app... This may take a minute.');
        
        // Poll for preview URL
        const checkPreview = setInterval(async () => {
          const projectCheck = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${project.id}`,
          );
          if (projectCheck.ok) {
            const updatedProject = await projectCheck.json();
            if (updatedProject.previewUrl) {
              setPreviewUrl(updatedProject.previewUrl);
              clearInterval(checkPreview);
              toast.success('Your app is ready!');
            }
          }
        }, 3000);

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(checkPreview), 120000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // Redirect to signup with demo project ID
    if (demoProjectId) {
      router.push(`/signup?demoProjectId=${demoProjectId}`);
    } else {
      router.push('/signup');
    }
  };

  // Auto-cleanup demo projects after 1 hour
  if (demoProjectId) {
    setTimeout(async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/projects/${demoProjectId}`,
          { method: 'DELETE' },
        );
      } catch (error) {
        console.error('Failed to cleanup demo project:', error);
      }
    }, 3600000); // 1 hour
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OmniForge Playground</h1>
          <p className="text-gray-600">Try building an app instantly. No signup required.</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!demoProjectId ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your app idea
                </label>
                <textarea
                  id="idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., A telemedicine app where patients can book video consultations with doctors, view their medical history, and receive prescriptions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !idea.trim()}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Building your app...' : 'Build Now (Free Demo)'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                This is a demo. Your project will be deleted after 1 hour. Sign up to save your work.
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your app is building!</h2>
                <p className="text-gray-600">
                  We&apos;re generating your app. This usually takes 1-2 minutes.
                </p>
              </div>

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium mb-2">✅ Your app is ready!</p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {previewUrl}
                    </a>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <iframe
                      src={previewUrl}
                      className="w-full h-96 rounded"
                      title="App Preview"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium mb-2">💡 Like what you see?</p>
                    <p className="text-blue-700 text-sm mb-4">
                      Sign up to save this project, deploy it, and access all features.
                    </p>
                    <button
                      onClick={handleSignUp}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Sign Up to Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">Building your app...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By using this playground, you agree to our demo terms.</p>
          <p className="mt-2">
            Demo projects are automatically deleted after 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}

