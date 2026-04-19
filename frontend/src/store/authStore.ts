import { create } from 'zustand';
import api from '@/lib/api';
import { useSettingsStore } from '@/store/settingsStore';

interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  register: async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await api.get('/api/auth/me');
      const d = res.data;
      if (d?.settings) {
        useSettingsStore.getState().applyServerSettings(d.settings);
      }
      set({
        user: { id: d.id, username: d.username, email: d.email, rating: d.rating },
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('accessToken');
      set({ isLoading: false });
    }
  },
}));