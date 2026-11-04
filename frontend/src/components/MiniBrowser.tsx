'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchUsers,
  createUserProfile,
  fetchSiteByAddress,
  recordVisit,
  fetchUserHistory,
  UserProfile,
  SiteResolutionResult,
  VisitRecord,
  NavigationType,
} from '@/lib/api';
import { normalizeAddress } from '@/lib/validation';
import { Toolbar } from './Toolbar';
import { SandboxedViewport, PagePreservedState } from './SandboxedViewport';
import { HistoryDrawer } from './HistoryDrawer';
import { SearchModal } from './SearchModal';
import { PublishModal } from './PublishModal';

const DEFAULT_HOME_ADDRESS = 'tidepool.zz';
const DEFAULT_USERS: UserProfile[] = [
  { name: 'Danish' },
  { name: 'Elena' },
  { name: 'Marcus' },
  { name: 'Sora' },
];

interface UserNavigationSession {
  stack: string[];
  currentIndex: number;
  preservedStates: Record<string, PagePreservedState>;
}

function createInitialSession(): UserNavigationSession {
  return {
    stack: [DEFAULT_HOME_ADDRESS],
    currentIndex: 0,
    preservedStates: {},
  };
}

export function MiniBrowser() {
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<string>('Danish');
  const [sessions, setSessions] = useState<
    Record<string, UserNavigationSession>
  >({
    Danish: createInitialSession(),
  });

  const [resolution, setResolution] = useState<SiteResolutionResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
  const [publishInitialAddress, setPublishInitialAddress] =
    useState<string>('');
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  const currentSession = sessions[currentUser] || createInitialSession();
  const activeAddress =
    currentSession.stack[currentSession.currentIndex] || DEFAULT_HOME_ADDRESS;
  const canGoBack = currentSession.currentIndex > 0;
  const canGoForward =
    currentSession.currentIndex < currentSession.stack.length - 1;

  const refreshHistory = useCallback(async (username: string) => {
    const historyList = await fetchUserHistory(username);
    setVisits(historyList);
  }, []);

  const resolveAddress = useCallback(async (address: string) => {
    setIsLoading(true);
    try {
      const res = await fetchSiteByAddress(address);
      setResolution(res);
    } catch (err) {
      setResolution({
        status: 'nowhere',
        address: normalizeAddress(address),
        message:
          err instanceof Error
            ? err.message
            : 'Unable to reach mini-browser backend server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: fetch users, initial site, and user's history
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const fetchedUsers = await fetchUsers();
        if (mounted && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
        }
      } catch {
        // Keep fallback users if backend not yet seeded
      }
      if (mounted) {
        await resolveAddress(DEFAULT_HOME_ADDRESS);
        await refreshHistory('Danish');
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [resolveAddress, refreshHistory]);

  // Keyboard shortcuts (Cmd/Ctrl+K for search, Escape to close modals)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPublishOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigate to a new address (pushes onto stack and truncates forward stack)
  const navigateTo = useCallback(
    async (rawAddress: string, navType: NavigationType) => {
      const address = normalizeAddress(rawAddress);
      if (!address) return;

      setSessions((prev) => {
        const userSess = prev[currentUser] || createInitialSession();
        const slicedStack = userSess.stack.slice(0, userSess.currentIndex + 1);
        const nextStack = [...slicedStack, address];
        return {
          ...prev,
          [currentUser]: {
            ...userSess,
            stack: nextStack,
            currentIndex: nextStack.length - 1,
          },
        };
      });

      await resolveAddress(address);
      await recordVisit(currentUser, address, navType);
      await refreshHistory(currentUser);
    },
    [currentUser, resolveAddress, refreshHistory],
  );

  const handleBack = useCallback(async () => {
    if (currentSession.currentIndex <= 0) return;
    const nextIndex = currentSession.currentIndex - 1;
    const targetAddress = currentSession.stack[nextIndex];

    setSessions((prev) => {
      const userSess = prev[currentUser] || createInitialSession();
      return {
        ...prev,
        [currentUser]: {
          ...userSess,
          currentIndex: nextIndex,
        },
      };
    });

    await resolveAddress(targetAddress);
    await recordVisit(currentUser, targetAddress, 'back');
    await refreshHistory(currentUser);
  }, [currentSession, currentUser, resolveAddress, refreshHistory]);

  const handleForward = useCallback(async () => {
    if (currentSession.currentIndex >= currentSession.stack.length - 1) return;
    const nextIndex = currentSession.currentIndex + 1;
    const targetAddress = currentSession.stack[nextIndex];

    setSessions((prev) => {
      const userSess = prev[currentUser] || createInitialSession();
      return {
        ...prev,
        [currentUser]: {
          ...userSess,
          currentIndex: nextIndex,
        },
      };
    });

    await resolveAddress(targetAddress);
    await recordVisit(currentUser, targetAddress, 'forward');
    await refreshHistory(currentUser);
  }, [currentSession, currentUser, resolveAddress, refreshHistory]);

  const handleJumpToStackIndex = useCallback(
    async (targetIndex: number) => {
      if (
        targetIndex < 0 ||
        targetIndex >= currentSession.stack.length ||
        targetIndex === currentSession.currentIndex
      ) {
        return;
      }
      const navType: NavigationType =
        targetIndex < currentSession.currentIndex ? 'back' : 'forward';
      const targetAddress = currentSession.stack[targetIndex];

      setSessions((prev) => {
        const userSess = prev[currentUser] || createInitialSession();
        return {
          ...prev,
          [currentUser]: {
            ...userSess,
            currentIndex: targetIndex,
          },
        };
      });

      await resolveAddress(targetAddress);
      await recordVisit(currentUser, targetAddress, navType);
      await refreshHistory(currentUser);
    },
    [currentSession, currentUser, resolveAddress, refreshHistory],
  );

  const handleSelectUser = useCallback(
    async (nextUser: string) => {
      setCurrentUser(nextUser);
      const nextSession = sessions[nextUser] || createInitialSession();
      if (!sessions[nextUser]) {
        setSessions((prev) => ({
          ...prev,
          [nextUser]: nextSession,
        }));
      }
      const nextAddress =
        nextSession.stack[nextSession.currentIndex] || DEFAULT_HOME_ADDRESS;
      await resolveAddress(nextAddress);
      await refreshHistory(nextUser);
    },
    [sessions, resolveAddress, refreshHistory],
  );

  const handleCreateUser = useCallback(
    async (name: string) => {
      const created = await createUserProfile(name);
      setUsers((prev) => {
        if (prev.some((u) => u.name.toLowerCase() === created.name.toLowerCase())) {
          return prev;
        }
        return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
      });
      await handleSelectUser(created.name);
    },
    [handleSelectUser],
  );

  const handleStateChange = useCallback(
    (address: string, state: PagePreservedState) => {
      const norm = normalizeAddress(address);
      setSessions((prev) => {
        const userSess = prev[currentUser] || createInitialSession();
        return {
          ...prev,
          [currentUser]: {
            ...userSess,
            preservedStates: {
              ...userSess.preservedStates,
              [norm]: state,
            },
          },
        };
      });
    },
    [currentUser],
  );

  const handleOpenPublishForAddress = useCallback((addr: string) => {
    setPublishInitialAddress(addr);
    setIsPublishOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Toolbar
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onCreateUser={handleCreateUser}
        activeAddress={activeAddress}
        isNowhere={resolution?.status === 'nowhere'}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={handleBack}
        onForward={handleForward}
        onReload={() => resolveAddress(activeAddress)}
        onHome={() => navigateTo(DEFAULT_HOME_ADDRESS, 'typed')}
        onNavigateTyped={(addr) => navigateTo(addr, 'typed')}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => setIsHistoryOpen((o) => !o)}
        historyCount={visits.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPublish={() => {
          setPublishInitialAddress('');
          setIsPublishOpen(true);
        }}
      />

      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        <SandboxedViewport
          activeAddress={activeAddress}
          resolution={resolution}
          isLoading={isLoading}
          preservedState={
            currentSession.preservedStates[normalizeAddress(activeAddress)]
          }
          onInternalLinkClick={(addr) => navigateTo(addr, 'link')}
          onStateChange={handleStateChange}
          onNavigateHome={() => navigateTo(DEFAULT_HOME_ADDRESS, 'link')}
          onGoBack={handleBack}
          canGoBack={canGoBack}
          onPublishAtAddress={handleOpenPublishForAddress}
        />

        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          currentUser={currentUser}
          stack={currentSession.stack}
          currentIndex={currentSession.currentIndex}
          onJumpToStackIndex={handleJumpToStackIndex}
          visits={visits}
          onNavigateFromHistory={(addr) => navigateTo(addr, 'typed')}
        />
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSite={(addr) => navigateTo(addr, 'typed')}
      />

      <PublishModal
        isOpen={isPublishOpen}
        initialAddress={publishInitialAddress}
        currentUser={currentUser}
        onClose={() => setIsPublishOpen(false)}
        onPublished={(addr) => navigateTo(addr, 'typed')}
      />
    </div>
  );
}
