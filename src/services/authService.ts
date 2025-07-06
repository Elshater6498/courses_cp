import type { 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse 
} from '../types/api';
import { apiService } from './api';

export class AuthService {
  private readonly basePath = '/dashboard/auth';

  // Admin login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.basePath}/login`, credentials);
    console.log(response);
    // Store token in localStorage
    if (response.success && response.data?.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    
    return response;
  }

  // Admin logout
  async logout(): Promise<ApiResponse<void>> {
    const response = await apiService.post<void>(`${this.basePath}/logout`);
    
    // Clear token from localStorage
    localStorage.removeItem('admin_token');
    
    return response;
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.basePath}/refresh`);
    
    // Update token in localStorage
    if (response.success && response.data?.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    
    return response;
  }

  // Get current admin profile
  async getProfile(): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.basePath}/profile`);
  }

  // Verify token
  async verifyToken(): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.basePath}/verify`);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    return !!token;
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  // Clear authentication
  clearAuth(): void {
    localStorage.removeItem('admin_token');
  }
}

export const authService = new AuthService(); 