import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

/**
 * SessionData represents the encrypted session payload.
 * This replaces the old unsigned JSON cookie.
 */
export interface SessionData {
  id: string;
  role: 'admin' | 'athlete' | 'official' | 'warden' | 'food_volunteer';
  profileId?: string;
  eventId?: string;
  eventName?: string;
  accommodationId?: string;
  accommodationName?: string;
  counterId?: string;
  counterName?: string;
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'fallback-dev-secret-must-be-at-least-32-chars-long!',
  cookieName: 'sportsos_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax' as const,
    path: '/',
  },
};

/**
 * Returns the current iron-session. Data is encrypted at rest in the cookie.
 * If the cookie is tampered with, iron-session will return an empty session.
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

/**
 * Destroys the current session (logout).
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
