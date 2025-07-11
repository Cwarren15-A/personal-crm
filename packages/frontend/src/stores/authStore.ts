import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async () => {
    set({ isLoading: true });
    
    try {
      // Demo login - always succeeds
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        name: 'Demo User'
      };

      set({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      // Demo logout - just clear state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // In demo mode, we're always authenticated
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        name: 'Demo User'
      };

      set({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }
})); 