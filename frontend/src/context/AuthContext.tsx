import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Gender, Role, User } from '../types';
import { authService } from '../api/authService';

const KEY = 'qh_auth';

interface Ctx {
  user: User | null;
  login: (email: string, password: string, role: Role, remember: boolean) => Promise<User>;
  register: (data: { name: string; email: string; password: string; gender: Gender }, remember: boolean) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<Ctx>(null as unknown as Ctx);

export const dashboardPath = (role: Role) => `/${role}/dashboard`;

/** "Remember me" keeps the session in localStorage (survives closing the browser); otherwise sessionStorage (this tab only). */
function readStored(): User | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function store(user: User | null, remember: boolean) {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    if (user) (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
  } catch { /* storage unavailable */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStored);

  const save = (u: User | null, remember: boolean) => { store(u, remember); setUser(u); };

  const login = async (email: string, password: string, role: Role, remember: boolean) => {
    const u = await authService.login(email, password, role);
    save(u, remember);
    return u;
  };
  const register = async (data: { name: string; email: string; password: string; gender: Gender }, remember: boolean) => {
    const u = await authService.registerLearner(data);
    save(u, remember);
    return u;
  };
  const logout = () => save(null, false);
  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    save(next, localStorage.getItem(KEY) !== null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
