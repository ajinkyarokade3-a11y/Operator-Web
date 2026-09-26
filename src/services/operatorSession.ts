/**
 * Minimal operator session holder (JWT + identity only — never passwords).
 *
 * Mirrors travelerSession: lives outside React so the API client and the
 * portal share one source of truth without an import cycle. The WanderAI
 * backend stays the single source of truth for trips; localStorage only
 * keeps the operator JWT needed to prove operator authorization.
 */

const STORAGE_KEY = 'tourflow_operator_session';

export interface OperatorUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  operator_name: string;
}

export interface OperatorSession {
  token: string;
  user: OperatorUser;
}

type Listener = () => void;

const listeners = new Set<Listener>();

function readStored(): OperatorSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === 'string' && parsed.token && typeof parsed?.user?.email === 'string') {
      return { token: parsed.token, user: parsed.user as OperatorUser };
    }
    return null;
  } catch {
    return null;
  }
}

let cached: OperatorSession | null | undefined;

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // never break callers because of a listener
    }
  });
}

export const operatorSession = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  get(): OperatorSession | null {
    if (cached === undefined) cached = readStored();
    return cached;
  },

  getToken(): string | null {
    return operatorSession.get()?.token || null;
  },

  set(session: OperatorSession): void {
    cached = session;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // private mode etc: in-memory session still works for this tab
    }
    notify();
  },

  clear(): void {
    cached = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
    notify();
  },
};
