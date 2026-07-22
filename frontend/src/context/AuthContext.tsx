import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';
type AuthValue = { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; logout: () => void; updateUser: (user: User) => void };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('daymark_token'));
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem('daymark_user') || 'null'); } catch { return null; } });
  const updateUser = (nextUser: User) => { localStorage.setItem('daymark_user', JSON.stringify(nextUser)); setUser(nextUser); };
  const login = async (email: string, password: string) => { const data = await api.login(email, password); localStorage.setItem('daymark_token', data.token); updateUser(data.user); setToken(data.token); };
  const logout = () => { localStorage.removeItem('daymark_token'); localStorage.removeItem('daymark_user'); setToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing'); return value; };
