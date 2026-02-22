'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (spec: Record<string, unknown>) => void;
}

type Tab = 'url' | 'image' | 'figma';

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [tab, setTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImportUrl = async () => {
    if (!url.trim()) {
      toast.error('Enter a URL');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/import/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error('Import failed');
      const spec = await res.json();
      onImport(spec);
      toast.success('Imported from URL!');
      onClose();
    } catch (e) {
      toast.error('Failed to import from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleImportImage = async () => {
    if (!imageFile) {
      toast.error('Select an image');
      return;
    }
    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = (reader.result as string)?.split(',')[1];
          result ? resolve(result) : reject(new Error('Invalid image'));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(imageFile);
      });
      const res = await fetch(`${API}/api/import/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error('Import failed');
      const spec = await res.json();
      onImport(spec);
      toast.success('Imported from image!');
      onClose();
    } catch (e) {
      toast.error('Failed to import from image');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFigma = async () => {
    if (!figmaUrl.trim()) {
      toast.error('Enter Figma URL or file key');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/import/figma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrKey: figmaUrl.trim() }),
      });
      if (!res.ok) throw new Error('Import failed');
      const spec = await res.json();
      onImport(spec);
      toast.success('Imported from Figma!');
      onClose();
    } catch (e) {
      toast.error('Failed to import from Figma. Check FIGMA_ACCESS_TOKEN.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'url', label: 'URL' },
    { id: 'image', label: 'Image' },
    { id: 'figma', label: 'Figma' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel rounded-xl p-6 w-full max-w-md border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Import Design</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Import any design. Turn it into a working app.
        </p>

        <div className="flex gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                tab === t.id ? 'bg-violet-600 text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'url' && (
          <div>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 mb-3"
            />
            <button
              onClick={handleImportUrl}
              disabled={loading}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import from URL'}
            </button>
          </div>
        )}

        {tab === 'image' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:cursor-pointer mb-3"
            />
            <button
              onClick={handleImportImage}
              disabled={loading || !imageFile}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import from Image'}
            </button>
          </div>
        )}

        {tab === 'figma' && (
          <div>
            <input
              type="text"
              placeholder="Figma file URL or file key"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 mb-3"
            />
            <button
              onClick={handleImportFigma}
              disabled={loading}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import from Figma'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
