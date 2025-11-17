'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SimilarIdea {
  id: string;
  title: string;
  description?: string;
  similarity?: number;
  source?: string;
}

interface SimilarIdeasProps {
  ideaId: string;
  onSelect?: (ideaId: string) => void;
}

export default function SimilarIdeas({ ideaId, onSelect }: SimilarIdeasProps) {
  const [similar, setSimilar] = useState<SimilarIdea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ideaId) {
      loadSimilar();
    }
  }, [ideaId]);

  const loadSimilar = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/ideas/${ideaId}/similar?limit=5`,
      );
      if (!response.ok) throw new Error('Failed to load similar ideas');
      const data = await response.json();
      setSimilar(data);
    } catch (error) {
      console.error('Failed to load similar ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-500">Loading similar ideas...</div>
      </div>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Similar Ideas
      </h3>
      <div className="space-y-2">
        {similar.map((idea) => (
          <div
            key={idea.id}
            className="p-3 bg-white rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition"
            onClick={() => onSelect?.(idea.id)}
          >
            <div className="font-medium text-gray-900">{idea.title}</div>
            {idea.description && (
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.description}</div>
            )}
            {idea.similarity && (
              <div className="text-xs text-blue-600 mt-2">
                {Math.round(idea.similarity * 100)}% similar
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

