import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  data: {
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('API Response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error); // Debug log
      if (error.response) {
        throw new Error(error.response.data.message || 'Login gagal');
      }
      throw new Error('Terjadi kesalahan jaringan');
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}; 