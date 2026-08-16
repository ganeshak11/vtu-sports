import { getSession, SessionData } from './session';

export type Role = SessionData['role'];

/**
 * Verifies that the current caller has one of the allowed roles.
 * Returns the session data if authorized.
 * Throws an error object if unauthorized (which server actions can return to the client).
 */
export async function requireRole(...allowedRoles: Role[]): Promise<SessionData> {
  const session = await getSession();

  if (!session.id || !session.role) {
    throw new AuthError('Not authenticated. Please log in.');
  }

  if (!allowedRoles.includes(session.role)) {
    throw new AuthError(`Unauthorized. Required role: ${allowedRoles.join(' or ')}. Your role: ${session.role}.`);
  }

  return session as SessionData;
}

/**
 * A typed error for authorization failures that server actions can catch and return cleanly.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
