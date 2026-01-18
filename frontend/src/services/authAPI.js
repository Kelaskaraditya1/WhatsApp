// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Google OAuth URL
export const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL || 'http://localhost:8080/oauth2/authorization/google';

// Generic fetch wrapper with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for cross-origin requests
  };

  try {
    const response = await fetch(url, config);
    
    // Parse response
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, error: error.message };
  }
};

// Auth API endpoints
export const authAPI = {
  // Send OTP to phone number
  sendOtp: async (phoneNumber) => {
    return apiRequest('/auth/send/otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  // Verify OTP (for phone verification during signup)
  verifyOtp: async (phoneNumber, otp) => {
    return apiRequest('/auth/verify/otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  },

  // Verify Login OTP (for existing users - returns user + JWT)
  verifyLoginOtp: async (phoneNumber, otp) => {
    return apiRequest('/auth/verify/login/otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  },

  // Signup with username and password
  signup: async (signupData, profilePic = null) => {
    const formData = new FormData();
    
    // Add JSON data
    const jsonData = {
      name: signupData.name,
      email: signupData.email,
      contact: signupData.contact,
      username: signupData.username,
      password: signupData.password,
      authType: 'EMAIL', // Default auth type for signup
      providerId: null,
    };
    
    formData.append('data', JSON.stringify(jsonData));
    
    // Add profile pic if provided
    if (profilePic) {
      formData.append('file', profilePic);
    }
    
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: formData,
    });
  },

  // Login with username and password
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Get current user info
  getCurrentUser: async (token) => {
    return apiRequest('/auth/user/me', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Initiate Google OAuth login (redirects to backend)
  loginWithGoogle: () => {
    window.location.href = GOOGLE_OAUTH_URL;
  },
};

export default authAPI;
