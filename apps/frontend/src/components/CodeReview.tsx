'use client';

import { useState } from 'react';
import { Button, Card, Spinner } from '@omniforge/ui';

interface CodeReviewProps {
  code: string;
  language?: string;
  onOptimized?: (optimized: string) => void;
}

export function CodeReview({ code, language = 'typescript', onOptimized }: CodeReviewProps) {
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<string | null>(null);

  const handleReview = async () => {
    setReviewing(true);
    try {
      const response = await fetch('http://localhost:3001/api/code-review/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setReview(data);
    } catch (error) {
      console.error('Error reviewing code:', error);
    } finally {
      setReviewing(false);
    }
  };

  const handleOptimize = async () => {
    if (!review) return;

    setOptimizing(true);
    try {
      const response = await fetch('http://localhost:3001/api/code-review/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, review, language }),
      });

      const optimizedCode = await response.text();
      setOptimized(optimizedCode);
      if (onOptimized) {
        onOptimized(optimizedCode);
      }
    } catch (error) {
      console.error('Error optimizing code:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleFullAnalysis = async () => {
    setReviewing(true);
    try {
      const response = await fetch('http://localhost:3001/api/code-review/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setReview(data.review);
      setOptimized(data.optimized);
      if (onOptimized && data.optimized) {
        onOptimized(data.optimized);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleReview} disabled={reviewing} variant="primary">
          {reviewing ? <Spinner size="sm" /> : 'Review Code'}
        </Button>
        <Button onClick={handleFullAnalysis} disabled={reviewing} variant="secondary">
          Full Analysis
        </Button>
      </div>

      {review && (
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Code Review</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              review.score >= 80 ? 'bg-green-100 text-green-700' :
              review.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Score: {review.score}/100
            </div>
          </div>

          {review.issues && review.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Issues</h4>
              <ul className="space-y-2">
                {review.issues.map((issue: any, i: number) => (
                  <li key={i} className={`text-sm ${
                    issue.severity === 'error' ? 'text-red-600' :
                    issue.severity === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    <span className="font-medium">{issue.severity.toUpperCase()}:</span> {issue.message}
                    {issue.line && <span className="text-gray-500"> (Line {issue.line})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.suggestions && review.suggestions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggestions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {review.suggestions.map((suggestion: string, i: number) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {review.score < 80 && (
            <Button onClick={handleOptimize} disabled={optimizing} variant="primary" className="mt-4">
              {optimizing ? <Spinner size="sm" /> : 'Optimize Code'}
            </Button>
          )}
        </Card>
      )}

      {optimized && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimized Code</h3>
          <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 max-h-96 overflow-y-auto">
            {optimized}
          </pre>
        </Card>
      )}
    </div>
  );
}

