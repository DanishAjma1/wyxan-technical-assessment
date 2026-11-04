'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Globe,
  Search,
  History,
  PlusCircle,
  UserCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { AddressBarSchema, UserProfileSchema } from '@/lib/validation';
import { UserProfile } from '@/lib/api';

interface ToolbarProps {
  users: UserProfile[];
  currentUser: string;
  onSelectUser: (name: string) => void;
  onCreateUser: (name: string) => Promise<void>;
  activeAddress: string;
  isNowhere: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onNavigateTyped: (address: string) => void;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  historyCount: number;
  onOpenSearch: () => void;
  onOpenPublish: () => void;
}

export function Toolbar({
  users,
  currentUser,
  onSelectUser,
  onCreateUser,
  activeAddress,
  isNowhere,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onHome,
  onNavigateTyped,
  isHistoryOpen,
  onToggleHistory,
  historyCount,
  onOpenSearch,
  onOpenPublish,
}: ToolbarProps) {
  const [addressInput, setAddressInput] = useState(activeAddress);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserError, setNewUserError] = useState<string | null>(null);

  useEffect(() => {
    setAddressInput(activeAddress);
    setAddressError(null);
  }, [activeAddress]);

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = AddressBarSchema.safeParse(addressInput);
    if (!parsed.success) {
      setAddressError(
        parsed.error.errors[0]?.message || 'Invalid custom address',
      );
      return;
    }
    setAddressError(null);
    onNavigateTyped(parsed.data);
  }

  async function handleAddUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = UserProfileSchema.safeParse({ name: newUserName });
    if (!parsed.success) {
      setNewUserError(parsed.error.errors[0]?.message || 'Invalid user name');
      return;
    }
    try {
      setNewUserError(null);
      await onCreateUser(parsed.data.name);
      setNewUserName('');
      setShowNewUserForm(false);
    } catch (err) {
      setNewUserError(
        err instanceof Error ? err.message : 'Failed to create user',
      );
    }
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 select-none z-20">
      {/* Top Browser Tab & User Profile Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wide ml-2">
            Wyxan Mini Browser
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono text-[11px]">
            .zz network
          </span>
        </div>

        {/* User Profile Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <label
              htmlFor="user-profile-switcher"
              className="text-slate-400 font-medium"
            >
              Current User:
            </label>
            <select
              id="user-profile-switcher"
              aria-label="Current User"
              value={currentUser}
              onChange={(e) => onSelectUser(e.target.value)}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {users.map((u) => (
                <option
                  key={u.name}
                  value={u.name}
                  className="bg-slate-900 text-slate-100"
                >
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {!showNewUserForm ? (
            <button
              type="button"
              onClick={() => setShowNewUserForm(true)}
              title="Add a new user profile"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Profile</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddUserSubmit}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Profile name..."
                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-500 w-28"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewUserForm(false);
                  setNewUserError(null);
                }}
                className="px-1.5 py-1 rounded text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </form>
          )}
          {newUserError && (
            <span className="text-rose-400 text-[11px]">{newUserError}</span>
          )}
        </div>
      </div>

      {/* Main Navigation & Address Bar Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        {/* Retrace Controls: Back, Forward, Reload, Home */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Back"
            title="Go Back"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onForward}
            disabled={!canGoForward}
            aria-label="Forward"
            title="Go Forward"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onReload}
            aria-label="Reload"
            title="Reload current address"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onHome}
            aria-label="Home (tidepool.zz)"
            title="Home Portal (tidepool.zz)"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar Input */}
        <form onSubmit={handleAddressSubmit} className="flex-1 min-w-0">
          <div
            className={`flex items-center bg-slate-950 border rounded-xl px-3 py-1.5 transition-colors ${
              addressError
                ? 'border-rose-500/80'
                : isNowhere
                  ? 'border-amber-500/60 focus-within:border-amber-400'
                  : 'border-slate-700/90 focus-within:border-sky-400'
            }`}
          >
            <Globe
              className={`w-4 h-4 mr-2.5 shrink-0 ${
                isNowhere ? 'text-amber-400' : 'text-sky-400'
              }`}
            />
            <span className="text-xs font-mono text-slate-500 mr-1 select-none hidden sm:inline">
              zz://
            </span>
            <input
              type="text"
              aria-label="Address bar"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (addressError) setAddressError(null);
              }}
              placeholder="Enter custom address (e.g. tidepool.zz, observatory.zz, atlantis.zz)..."
              className="flex-1 bg-transparent text-sm text-slate-100 font-mono focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="ml-2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition-colors shrink-0"
            >
              Go
            </button>
          </div>
        </form>

        {/* Browser Feature Buttons: Search, History Drawer, Publish */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={onToggleHistory}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isHistoryOpen
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 text-[11px] font-mono">
              {historyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Publish Site</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner if invalid address typed */}
      {addressError && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-950/60 border-t border-rose-800/50 text-rose-300 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{addressError}</span>
        </div>
      )}
    </header>
  );
}
