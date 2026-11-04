import { PublishSiteInput, normalizeAddress } from './validation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type NavigationType = 'typed' | 'link' | 'back' | 'forward';

export interface UserProfile {
  _id?: string;
  name: string;
}

export interface SiteData {
  _id?: string;
  address: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface SearchSiteResult extends SiteData {
  snippet: string;
  score: number;
}

export interface VisitRecord {
  _id?: string;
  userId: string;
  address: string;
  timestamp: string;
  navigationType: NavigationType;
}

export type SiteResolutionResult =
  | { status: 'ok'; site: SiteData }
  | { status: 'nowhere'; address: string; message: string };

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch user profiles');
  }
  return res.json();
}

export async function createUserProfile(name: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create user profile');
  }
  return res.json();
}

export async function fetchSiteByAddress(
  rawAddress: string,
): Promise<SiteResolutionResult> {
  const address = normalizeAddress(rawAddress);
  const res = await fetch(
    `${API_BASE_URL}/sites/${encodeURIComponent(address)}`,
    { cache: 'no-store' },
  );

  if (res.status === 404) {
    const err = await res.json().catch(() => ({}));
    return {
      status: 'nowhere',
      address,
      message:
        err.message || `Nothing has been published at "${address}" yet.`,
    };
  }

  if (!res.ok) {
    throw new Error(`Failed to resolve address "${address}"`);
  }

  const site: SiteData = await res.json();
  return { status: 'ok', site };
}

export async function fetchAllSites(): Promise<SiteData[]> {
  const res = await fetch(`${API_BASE_URL}/sites`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function searchSites(query: string): Promise<SearchSiteResult[]> {
  const res = await fetch(
    `${API_BASE_URL}/sites/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) {
    throw new Error('Search request failed');
  }
  return res.json();
}

export async function publishSite(input: PublishSiteInput): Promise<SiteData> {
  const res = await fetch(`${API_BASE_URL}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to publish site');
  }

  return res.json();
}

export async function recordVisit(
  userId: string,
  address: string,
  navigationType: NavigationType,
): Promise<VisitRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        address: normalizeAddress(address),
        navigationType,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchUserHistory(
  username: string,
): Promise<VisitRecord[]> {
  const res = await fetch(
    `${API_BASE_URL}/history?user=${encodeURIComponent(username)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}
