'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Code2,
  Eye,
  UserCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PublishSiteSchema } from '@/lib/validation';
import { publishSite } from '@/lib/api';

interface PublishModalProps {
  isOpen: boolean;
  initialAddress?: string;
  currentUser: string;
  onClose: () => void;
  onPublished: (address: string) => void;
}

const STARTER_TEMPLATES = [
  {
    name: 'Cozy Archipelago Page',
    title: 'Coral Cove Sanctuary',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 32px; line-height: 1.6; }
    .box { max-width: 720px; margin: 0 auto; background: #1e293b; border: 1px solid #38bdf8; border-radius: 12px; padding: 24px; }
    h1 { margin-top: 0; color: #38bdf8; }
    a { color: #7dd3fc; font-weight: 600; }
    input, textarea { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #475569; color: #fff; padding: 8px; border-radius: 6px; margin-top: 6px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🐚 Welcome to My Custom .zz Node</h1>
    <p>This page was published live from the Wyxan Mini Browser publishing engine. Return to <a href="tidepool.zz">tidepool.zz</a> or visit <a href="observatory.zz">observatory.zz</a>.</p>
    <h3>Visitor Guestbook</h3>
    <label>Your Name</label>
    <input type="text" name="guest_name" placeholder="Traveler name..." />
    <label>Message</label>
    <textarea name="guest_message" rows="3" placeholder="Leave a note..."></textarea>
  </div>
</body>
</html>`,
  },
  {
    name: 'Research Telemetry Node',
    title: 'Sub-Surface Sonar Beacon',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; background: #020617; color: #4ade80; padding: 32px; line-height: 1.6; }
    .panel { max-width: 700px; margin: 0 auto; border: 1px solid #22c55e; padding: 24px; border-radius: 8px; background: #090d16; }
    a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="panel">
    <h1>📡 Sub-Surface Sonar Beacon</h1>
    <p>Depth: 1,420m | Signal Lock: ACTIVE | Connected to <a href="tidepool.zz">tidepool.zz</a> and <a href="cipher.zz">cipher.zz</a>.</p>
    <p>Acoustic ping interval steady at 12.4 seconds.</p>
  </div>
</body>
</html>`,
  },
];

export function PublishModal({
  isOpen,
  initialAddress = '',
  currentUser,
  onClose,
  onPublished,
}: PublishModalProps) {
  const [address, setAddress] = useState(initialAddress);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(STARTER_TEMPLATES[0].html);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress || '');
      setError(null);
      setActiveTab('edit');
    }
  }, [isOpen, initialAddress]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = PublishSiteSchema.safeParse({
      address,
      title,
      body,
      author: currentUser,
    });

    if (!parsed.success) {
      setError(
        parsed.error.errors[0]?.message || 'Please check your input fields.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await publishSite(parsed.data);
      onPublished(created.address);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to publish site.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publish New Site"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Publish a New .zz Page
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                Publishing as author:{' '}
                <strong className="text-sky-300">{currentUser}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Publish Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="publish-address-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Unique Custom Address
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-sky-400">
                <span className="text-xs font-mono text-slate-500 mr-1">
                  zz://
                </span>
                <input
                  id="publish-address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. atlantis.zz or studio.zz"
                  className="flex-1 bg-transparent text-sm text-slate-100 font-mono focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Must be a unique domain-style address (such as{' '}
                <code>atlantis.zz</code>).
              </p>
            </div>

            <div>
              <label
                htmlFor="publish-title-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Page Title
              </label>
              <input
                id="publish-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lost City of Atlantis"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Indexed for full-text search across the mini browser.
              </p>
            </div>
          </div>

          {/* Starter Templates & Editor/Preview Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Templates:
              </span>
              {STARTER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => {
                    if (!title) setTitle(tpl.title);
                    setBody(tpl.html);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  {tpl.name}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Raw HTML
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Sandboxed Preview
              </button>
            </div>
          </div>

          {/* HTML Editor or Live Sandboxed Preview */}
          {activeTab === 'edit' ? (
            <div>
              <textarea
                aria-label="Raw HTML Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Enter raw HTML content..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-emerald-300 font-mono leading-relaxed focus:outline-none focus:border-sky-400"
                required
              />
            </div>
          ) : (
            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 h-72">
              <iframe
                title="Live Sandboxed Preview"
                sandbox="allow-scripts"
                srcDoc={body}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-sky-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Publishing...' : 'Publish to .zz Web'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
