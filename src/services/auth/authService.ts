// Define types for auth requests and responses
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  
  export interface AuthError {
    message: string;
    errors?: Record<string, string[]>;
  }
  
  // Auth service functions
  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch('https://profile-matching-chi.vercel.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData: AuthError = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again later.');
    }
  };
  
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  
  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
  };
  
  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };
  
  const authService = {
    login,
    logout,
    isAuthenticated,
    getToken,
  };
  
  export default authService;