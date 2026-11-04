'use client';

import React from 'react';
import {
  X,
  Clock,
  Layers,
  CornerDownRight,
  ArrowLeft,
  ArrowRight,
  Link2,
  Keyboard,
} from 'lucide-react';
import { NavigationType, VisitRecord } from '@/lib/api';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  stack: string[];
  currentIndex: number;
  onJumpToStackIndex: (index: number) => void;
  visits: VisitRecord[];
  onNavigateFromHistory: (address: string) => void;
}

function getNavigationBadge(navType: NavigationType) {
  switch (navType) {
    case 'typed':
      return {
        label: 'typed',
        className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        Icon: Keyboard,
      };
    case 'link':
      return {
        label: 'link',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        Icon: Link2,
      };
    case 'back':
      return {
        label: 'back',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        Icon: ArrowLeft,
      };
    case 'forward':
      return {
        label: 'forward',
        className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        Icon: ArrowRight,
      };
  }
}

export function HistoryDrawer({
  isOpen,
  onClose,
  currentUser,
  stack,
  currentIndex,
  onJumpToStackIndex,
  visits,
  onNavigateFromHistory,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Browsing History Drawer"
      className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none z-10"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Retrace & History
          </h2>
          <p className="text-[11px] text-slate-400">
            Profile: <strong className="text-slate-200">{currentUser}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close History Drawer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
        {/* Session Navigation Stack */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Active Session Stack
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Pointer: {currentIndex + 1} / {stack.length}
            </span>
          </div>
          <div className="space-y-1">
            {stack.map((addr, idx) => {
              const isCurrent = idx === currentIndex;
              const isAhead = idx > currentIndex;
              return (
                <button
                  key={`${idx}-${addr}`}
                  type="button"
                  onClick={() => onJumpToStackIndex(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-colors ${
                    isCurrent
                      ? 'bg-sky-500/20 border border-sky-500/40 text-sky-200 font-semibold'
                      : isAhead
                        ? 'text-slate-500 hover:bg-slate-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <CornerDownRight className="w-3 h-3 shrink-0 opacity-60" />
                    <span className="truncate">{addr}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/70">
                    {isCurrent ? 'ACTIVE' : isAhead ? 'FORWARD' : 'BACK'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chronological Persisted History Log */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chronological Visit Log ({visits.length})
            </h3>
          </div>

          {visits.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No visits recorded for {currentUser} yet.
            </p>
          ) : (
            <div className="space-y-2">
              {visits.map((visit, idx) => {
                const badge = getNavigationBadge(visit.navigationType);
                const BadgeIcon = badge.Icon;
                const timeStr = new Date(visit.timestamp).toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  },
                );
                return (
                  <div
                    key={visit._id || `${idx}-${visit.timestamp}`}
                    onClick={() => onNavigateFromHistory(visit.address)}
                    className="group p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-sky-300 group-hover:underline truncate">
                        {visit.address}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${badge.className}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{timeStr}</span>
                      <span>Click to visit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
