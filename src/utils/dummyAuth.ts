// This file contains dummy authentication functionality for testing purposes
// IMPORTANT: Comment out the dummy implementation when connecting to real API

import authService, { LoginRequest, LoginResponse } from '../services/auth/authService';

// Dummy user credentials that will work with the mock
export const DUMMY_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Dummy user data returned after successful login
const DUMMY_USER: LoginResponse = {
  token: 'dummy-jwt-token-12345',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  }
};

// Mock implementation of the login function
const dummyLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check credentials
  if (credentials.email === DUMMY_CREDENTIALS.email && 
      credentials.password === DUMMY_CREDENTIALS.password) {
    return { ...DUMMY_USER };
  }
  
  // Simulate error for incorrect credentials
  throw new Error('Invalid email or password');
};

// ========================================================
// TOGGLE COMMENTS BELOW TO SWITCH BETWEEN DUMMY AND REAL AUTH
// ========================================================

// OPTION 1: Comment out this section to use real API
// Replace the real login method with the dummy one
(authService as any).login = dummyLogin;

// OPTION 2: Uncomment this section to use real API and comment out OPTION 1
/*
// This restores the original implementation
// No need to do anything here as the real implementation is already in authService
*/

export default authService;