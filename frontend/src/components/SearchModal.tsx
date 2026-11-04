'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Globe,
  User,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { searchSites, SearchSiteResult } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite: (address: string) => void;
}

const SUGGESTED_QUERIES = [
  'exoplanet',
  'moss',
  'ramen',
  'synth',
  'atlantis',
  'cipher',
  'lantern',
];

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}): React.ReactElement {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0 || !text) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark
            key={i}
            className="bg-amber-400/30 text-amber-200 px-0.5 rounded font-semibold"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectSite,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSiteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await searchSites(query);
        if (!cancelled) {
          setResults(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to search sites',
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Published Sites"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all published .zz page titles, addresses, and HTML bodies..."
            className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Keyword Suggestions */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto text-xs">
          <span className="text-slate-400 inline-flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Try:
          </span>
          {SUGGESTED_QUERIES.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className={`px-2.5 py-0.5 rounded-full border text-xs transition-colors shrink-0 ${
                query.toLowerCase() === suggestion
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {isSearching && results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Searching published sites...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-300 font-medium text-sm mb-1">
                No matching pages found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-slate-500 text-xs">
                Try another keyword or publish a new page with this topic.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.address}
                type="button"
                onClick={() => {
                  onSelectSite(item.address);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-300 font-mono text-xs font-semibold shrink-0">
                      <Globe className="w-3 h-3" />
                      <HighlightedText text={item.address} query={query} />
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                      <HighlightedText text={item.title} query={query} />
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <User className="w-3 h-3 text-slate-500" />
                    {item.author}
                    <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </span>
                </div>
                {item.snippet && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
                    <HighlightedText text={item.snippet} query={query} />
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Showing <strong>{results.length}</strong>{' '}
            {results.length === 1 ? 'site' : 'sites'}
            {query ? ` matching "${query}"` : ' in directory'}
          </span>
          <span>Click any result to navigate immediately</span>
        </div>
      </div>
    </div>
  );
}
