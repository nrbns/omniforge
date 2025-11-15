'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card } from '@omniforge/ui';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [searchType, setSearchType] = useState<'hybrid' | 'semantic' | 'rag'>('hybrid');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const endpoint =
        searchType === 'hybrid' ? 'search' :
        searchType === 'semantic' ? 'search/semantic' :
        'search/rag';

      const response = await fetch(
        `http://localhost:3001/api/${endpoint}?q=${encodeURIComponent(query)}&limit=10`
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Search</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="elevated" className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Input
                label="Search Query"
                placeholder="Search ideas, templates, knowledge base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hybrid"
                  checked={searchType === 'hybrid'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                Hybrid Search
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="semantic"
                  checked={searchType === 'semantic'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                Semantic Search
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="rag"
                  checked={searchType === 'rag'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                RAG Search
              </label>
            </div>

            <Button onClick={handleSearch} disabled={loading || !query.trim()} variant="primary" className="w-full">
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </Card>

        {results && (
          <div className="space-y-4">
            {searchType === 'rag' && results.answer && (
              <Card variant="elevated" className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Answer</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{results.answer}</p>
                {results.sources && results.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {results.sources.map((source: any, i: number) => (
                        <li key={i}>• {source.metadata?.title || source.id}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {results.ideas && results.ideas.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ideas</h2>
                <div className="space-y-4">
                  {results.ideas.map((idea: any) => (
                    <Card key={idea.id} variant="default" className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/ideas/${idea.id}`)}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{idea.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {results.vectorResults && results.vectorResults.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Content</h2>
                <div className="space-y-4">
                  {results.vectorResults.map((result: any, i: number) => (
                    <Card key={i} variant="default" className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Relevance: {Math.round(result.score * 100)}%</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{result.document.content}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

