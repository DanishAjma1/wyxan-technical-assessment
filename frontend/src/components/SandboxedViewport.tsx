'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  ArrowLeft,
  Home,
  FilePlus2,
  ShieldCheck,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { SiteResolutionResult } from '@/lib/api';

export interface PagePreservedState {
  scrollX: number;
  scrollY: number;
  formState: Record<string, string | boolean>;
}

interface SandboxedViewportProps {
  activeAddress: string;
  resolution: SiteResolutionResult | null;
  isLoading: boolean;
  preservedState?: PagePreservedState;
  onInternalLinkClick: (address: string) => void;
  onStateChange: (address: string, state: PagePreservedState) => void;
  onNavigateHome: () => void;
  onGoBack: () => void;
  canGoBack: boolean;
  onPublishAtAddress?: (address: string) => void;
}

function buildSandboxedSrcDoc(rawHtml: string, address: string): string {
  // Neutralize any attempts to break out of the script tag or set base/meta refresh
  const sanitizedHtml = rawHtml
    .replace(/<base\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, '');

  const bridgeScript = `
<script>
(function() {
  var PAGE_ADDRESS = ${JSON.stringify(address)};

  function getFieldKey(el, idx) {
    var tag = (el.tagName || '').toLowerCase();
    var name = el.getAttribute('name') || '';
    var id = el.getAttribute('id') || '';
    return tag + ':' + (name || id || ('idx_' + idx));
  }

  function collectFormState() {
    var fields = document.querySelectorAll('input, textarea, select');
    var formState = {};
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      var key = getFieldKey(el, i);
      if (el.type === 'checkbox' || el.type === 'radio') {
        formState[key] = Boolean(el.checked);
      } else {
        formState[key] = el.value || '';
      }
    }
    return formState;
  }

  function emitStateUpdate() {
    window.parent.postMessage({
      type: 'MINI_BROWSER_STATE_UPDATE',
      address: PAGE_ADDRESS,
      state: {
        scrollX: window.scrollX || window.pageXOffset || 0,
        scrollY: window.scrollY || window.pageYOffset || 0,
        formState: collectFormState()
      }
    }, '*');
  }

  function restoreState(state) {
    if (!state) return;
    if (state.formState) {
      var fields = document.querySelectorAll('input, textarea, select');
      for (var i = 0; i < fields.length; i++) {
        var el = fields[i];
        var key = getFieldKey(el, i);
        if (Object.prototype.hasOwnProperty.call(state.formState, key)) {
          var val = state.formState[key];
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = Boolean(val);
          } else if (typeof val === 'string') {
            el.value = val;
          }
        }
      }
    }
    if (typeof state.scrollX === 'number' || typeof state.scrollY === 'number') {
      window.scrollTo(state.scrollX || 0, state.scrollY || 0);
      setTimeout(function() {
        window.scrollTo(state.scrollX || 0, state.scrollY || 0);
      }, 30);
    }
  }

  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document && target.tagName !== 'A') {
      target = target.parentNode;
    }
    if (target && target.tagName === 'A') {
      var href = target.getAttribute('href');
      if (href) {
        e.preventDefault();
        e.stopPropagation();
        if (href.charAt(0) === '#') {
          var anchor = document.querySelector(href);
          if (anchor && anchor.scrollIntoView) anchor.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        emitStateUpdate();
        window.parent.postMessage({
          type: 'MINI_BROWSER_NAVIGATE',
          address: href
        }, '*');
      }
    }
  }, true);

  document.addEventListener('input', emitStateUpdate, true);
  document.addEventListener('change', emitStateUpdate, true);

  var scrollTimer = null;
  window.addEventListener('scroll', function() {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(emitStateUpdate, 60);
  }, { passive: true });

  window.addEventListener('message', function(e) {
    var data = e.data;
    if (data && data.type === 'MINI_BROWSER_RESTORE_STATE' && data.address === PAGE_ADDRESS) {
      restoreState(data.state);
    }
  });

  function notifyReady() {
    window.parent.postMessage({
      type: 'MINI_BROWSER_FRAME_READY',
      address: PAGE_ADDRESS
    }, '*');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(notifyReady, 10);
  } else {
    window.addEventListener('DOMContentLoaded', notifyReady);
  }
  window.addEventListener('load', notifyReady);
})();
</script>`;

  if (/<\/body>/i.test(sanitizedHtml)) {
    return sanitizedHtml.replace(/<\/body>/i, `${bridgeScript}</body>`);
  }
  return `${sanitizedHtml}\n${bridgeScript}`;
}

export function SandboxedViewport({
  activeAddress,
  resolution,
  isLoading,
  preservedState,
  onInternalLinkClick,
  onStateChange,
  onNavigateHome,
  onGoBack,
  canGoBack,
  onPublishAtAddress,
}: SandboxedViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const preservedStateRef = useRef<PagePreservedState | undefined>(
    preservedState,
  );

  useEffect(() => {
    preservedStateRef.current = preservedState;
  }, [preservedState]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (
        data.type === 'MINI_BROWSER_NAVIGATE' &&
        typeof data.address === 'string'
      ) {
        onInternalLinkClick(data.address);
      } else if (
        data.type === 'MINI_BROWSER_STATE_UPDATE' &&
        typeof data.address === 'string' &&
        data.state
      ) {
        onStateChange(data.address, data.state as PagePreservedState);
      } else if (
        data.type === 'MINI_BROWSER_FRAME_READY' &&
        data.address === activeAddress
      ) {
        if (preservedStateRef.current && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'MINI_BROWSER_RESTORE_STATE',
              address: activeAddress,
              state: preservedStateRef.current,
            },
            '*',
          );
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeAddress, onInternalLinkClick, onStateChange]);

  const srcDoc = useMemo(() => {
    if (resolution?.status !== 'ok') return '';
    return buildSandboxedSrcDoc(resolution.site.body, resolution.site.address);
  }, [resolution]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8">
        <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">
          Resolving <span className="text-sky-400 font-mono">{activeAddress}</span>...
        </p>
      </div>
    );
  }

  if (!resolution || resolution.status === 'nowhere') {
    const missingAddress = resolution?.address || activeAddress;
    return (
      <div
        data-testid="nowhere-view"
        className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-8 overflow-y-auto"
      >
        <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Compass className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            404 • Nowhere
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            You&apos;ve Reached Nowhere
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            No page has been published at{' '}
            <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-mono">
              {missingAddress}
            </code>
            . This address is uncharted territory in the mini-web.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {canGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to tidepool.zz
            </button>
            {onPublishAtAddress && (
              <button
                type="button"
                onClick={() => onPublishAtAddress(missingAddress)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                Publish at {missingAddress}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { site } = resolution;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      {/* Site Metadata Sub-header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3 truncate">
          <span className="font-semibold text-slate-200 truncate">
            {site.title}
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <User className="w-3 h-3 text-sky-400" />
            Published by <strong className="text-slate-200">{site.author}</strong>
          </span>
          {site.createdAt && (
            <>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                {new Date(site.createdAt).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {preservedState &&
            (preservedState.scrollY > 0 ||
              Object.keys(preservedState.formState || {}).length > 0) && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                State Saved
              </span>
            )}
          <span
            title="Rendered inside an isolated cross-origin sandboxed iframe (sandbox='allow-scripts')"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px]"
          >
            <ShieldCheck className="w-3 h-3" />
            Sandboxed Iframe
          </span>
        </div>
      </div>

      {/* Isolated Sandboxed Iframe Viewport */}
      <iframe
        ref={iframeRef}
        key={`${site.address}`}
        title={site.title || site.address}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className="flex-1 w-full h-full border-0 bg-slate-950"
      />
    </div>
  );
}
