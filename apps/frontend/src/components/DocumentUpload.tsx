'use client';

import { useState } from 'react';
import { Input, Button, Spinner } from '@omniforge/ui';

interface DocumentUploadProps {
  ideaId?: string;
  onUploadComplete?: (result: any) => void;
}

export function DocumentUpload({ ideaId, onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'pdf' | 'image' | 'audio' | 'text'>('pdf');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (ideaId) {
        formData.append('ideaId', ideaId);
      }

      const endpoint = ideaId
        ? `http://localhost:3001/api/documents/ideas/${ideaId}/upload`
        : 'http://localhost:3001/api/documents/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept={
              type === 'pdf' ? '.pdf' :
              type === 'image' ? 'image/*' :
              type === 'audio' ? 'audio/*' :
              '.txt,.md'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          variant="primary"
          className="w-full"
        >
          {uploading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Document processed successfully! Extracted {result.extractedText?.length || 0} characters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

