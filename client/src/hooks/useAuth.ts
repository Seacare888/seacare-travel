import { useState } from 'react';

export interface AuthUser { id: string; username: string; name: string; role: string; }

const KEY = 'seacare_user';

export function getStoredUser(): AuthUser | null {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

export function storeUser(user: AuthUser) { localStorage.setItem(KEY, JSON.stringify(user)); }
export function clearUser() { localStorage.removeItem(KEY); }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const login = (u: AuthUser) => { storeUser(u); setUser(u); };
  const logout = () => { clearUser(); setUser(null); };
  return { user, login, logout, isAdmin: user?.role === 'admin' };
}
