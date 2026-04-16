import { getQfAccessToken, refreshQfToken } from './qfOAuth';

// Pre-production API base URLs (from official pre-live docs)
// Auth/Streaks endpoints: /auth/v1/...
// Bookmarks/Collections endpoints: /v1/...
const QURAN_API_BASE =
  (import.meta.env.VITE_QURAN_API_BASE as string | undefined) ||
  'https://apis-prelive.quran.foundation';

const QURAN_USER_API_BASE = `${QURAN_API_BASE}/auth/v1`;

type QuranApiSuccess<T> = {
  success: boolean;
  data: T;
};

type QuranStreak = {
  id: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'BROKEN';
  days: number;
};

type AddBookmarkPayload = {
  key: number;       // Surah number
  verseNumber: number;
  mushaf?: number;   // Mushaf ID: 1=QCFV2, 4=UthmaniHafs, etc.
  isReading?: boolean;
};

const getUserApiHeaders = () => {
  const token =
    getQfAccessToken() || (import.meta.env.VITE_QURAN_USER_TOKEN as string | undefined);
  const clientId = import.meta.env.VITE_QURAN_CLIENT_ID as string | undefined;

  if (!token || !clientId) {
    return null;
  }

  return {
    'x-auth-token': token,
    'x-client-id': clientId,
    'Content-Type': 'application/json',
  };
};

export const getQuranUserStreaks = async (): Promise<QuranStreak[]> => {
  const headers = getUserApiHeaders();
  if (!headers) return [];

  try {
    const res = await fetch(`${QURAN_USER_API_BASE}/streaks?type=QURAN&first=5`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      console.error('Quran User API streaks request failed:', res.status);
      return [];
    }

    const json = (await res.json()) as QuranApiSuccess<QuranStreak[]>;
    return json?.data || [];
  } catch (error) {
    console.error('Error fetching Quran user streaks:', error);
    return [];
  }
};

const doBookmarkRequest = async (
  headers: Record<string, string>,
  body: object
): Promise<Response> => {
  // /auth/v1/bookmarks is the valid path on the pre-live server
  // (covered by the 'bookmark' OAuth scope)
  return fetch(`${QURAN_USER_API_BASE}/bookmarks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

export const addQuranUserBookmark = async ({
  key,
  verseNumber,
  mushaf = 1,
  isReading = true,
}: AddBookmarkPayload): Promise<{ success: boolean; message?: string }> => {
  let headers = getUserApiHeaders();
  if (!headers) {
    return { success: false, message: 'Please connect your Quran.com account in Settings first.' };
  }

  const body = {
    key,            // Surah number (per official docs)
    verseNumber,
    type: 'ayah',
    mushaf,
    isReading,
  };

  try {
    let res = await doBookmarkRequest(headers, body);

    // If token expired, try to refresh once and retry
    if (res.status === 403) {
      const newToken = await refreshQfToken();
      if (newToken) {
        headers = { ...headers, 'x-auth-token': newToken };
        res = await doBookmarkRequest(headers, body);
      }
    }

    if (!res.ok) {
      const responseBody = await res.text();
      console.error('Quran User API add bookmark failed:', res.status, responseBody);
      return { success: false, message: `Bookmark request failed (${res.status}).` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding Quran user bookmark:', error);
    return { success: false, message: 'Network error while saving bookmark.' };
  }
};

export type QuranBookmark = {
  id: string;
  createdAt: string;
  type: 'ayah' | 'surah' | 'page' | 'juz';
  key: number;          // Surah number
  verseNumber: number;  // Ayah number
  isReading: boolean;
  mushaf: number;
};

export const getQuranUserBookmarks = async (): Promise<QuranBookmark[]> => {
  let headers = getUserApiHeaders();
  if (!headers) return [];

  try {
    let res = await fetch(`${QURAN_USER_API_BASE}/bookmarks?mushafId=1&first=20`, { method: 'GET', headers });

    // Auto-refresh if token expired
    if (res.status === 403) {
      const newToken = await refreshQfToken();
      if (newToken) {
        headers = { ...headers, 'x-auth-token': newToken };
        res = await fetch(`${QURAN_USER_API_BASE}/bookmarks?mushafId=1&first=20`, { method: 'GET', headers });
      }
    }

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Quran User API get bookmarks failed:', res.status, errBody);
      return [];
    }

    const json = await res.json();
    console.log('[Bookmarks] API response:', JSON.stringify(json));
    return (json?.data as QuranBookmark[]) || [];
  } catch (error) {
    console.error('Error fetching Quran user bookmarks:', error);
    return [];
  }
};
