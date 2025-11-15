import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            OmniForge
          </Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Build Apps from Ideas
            <span className="block text-primary-600">Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The world's first open-source, end-to-end AI builder that transforms
            your ideas into production-ready apps with real-time collaboration,
            multi-agent generation, and app store packaging.
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="px-8 py-4 text-lg font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Building
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-4 text-lg font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <a
              href="https://github.com/omniforge/omniforge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">Redix Idea Layer</h3>
            <p className="text-gray-600">
              Version control for ideas with semantic search, knowledge graphs,
              and real-time collaboration.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Agent Engine</h3>
            <p className="text-gray-600">
              Specialized AI agents work together to plan, design, build, test,
              and deploy your app.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">One-Click Deploy</h3>
            <p className="text-gray-600">
              Deploy to web, iOS, and Android with automated CI/CD and app store
              packaging.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

