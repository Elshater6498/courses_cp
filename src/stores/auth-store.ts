import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '../types/api';
import * as authService from '../services/auth-service';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: { email?: string; userName?: string; password: string }) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: Admin | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(credentials);
          console.log(response);
          
          if (response.success && response.data) {
            const { admin, token } = response.data;
            set({ 
              admin, 
              token, 
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.clearAuth();
        set({ 
          admin: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },

      setAdmin: (admin) => {
        set({ admin, isAuthenticated: !!admin });
      },

      setToken: (token) => {
        set({ token });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      hasPermission: (permission) => {
        const { admin } = get();
        if (!admin?.roleId?.permissions) return false;
        
        return admin.roleId.permissions.some(p => 
          p.name === permission || 
          `${p.action}_${p.resource}` === permission
        );
      },

      hasAnyPermission: (permissions) => {
        const { admin } = get();
        if (!admin?.roleId?.permissions) return false;
        
        return permissions.some(permission => 
          admin.roleId.permissions.some(p => 
            p.name === permission || 
            `${p.action}_${p.resource}` === permission
          )
        );
      },

      hasRole: (roleName) => {
        const { admin } = get();
        return admin?.roleId?.name === roleName;
      },

      initialize: async () => {
        try {
          set({ isLoading: true });
          const token = authService.getToken();
          
          if (token) {
            // Verify token and get admin profile
            const response = await authService.getProfile();
            if (response.success && response.data) {
              set({ 
                admin: response.data, 
                token, 
                isAuthenticated: true,
                isLoading: false 
              });
            } else {
              // Token invalid, clear it
              authService.clearAuth();
              set({ 
                admin: null, 
                token: null, 
                isAuthenticated: false,
                isLoading: false 
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          // Error verifying token, clear it
          authService.clearAuth();
          set({ 
            admin: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 