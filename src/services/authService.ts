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

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
  success: boolean;
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

  async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const response = await axios.post(
        `${API_URL}/auth/change-password`, 
        passwordData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Change password response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error.response?.data || error); // Debug log
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 401) {
          throw new Error('Password lama tidak sesuai');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data.message || 'Data tidak valid');
        } else if (error.response.status === 403) {
          throw new Error('Akses ditolak. Silakan login kembali.');
        }
        throw new Error(error.response.data.message || 'Gagal mengubah password');
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