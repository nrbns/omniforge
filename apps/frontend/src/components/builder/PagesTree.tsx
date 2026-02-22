'use client';

import { useBuilderStore } from '../../stores/builder-store';

export function PagesTree() {
  const { pages, selectedPageId, setSelectedPage } = useBuilderStore();

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pages</h3>
      <ul className="space-y-1">
        {pages.map((page) => (
          <li key={page.id}>
            <button
              onClick={() => setSelectedPage(page.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                selectedPageId === page.id
                  ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-500'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {page.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
