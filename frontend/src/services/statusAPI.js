// Status API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Generic fetch wrapper with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
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

export const statusAPI = {
  // Get all statuses for a user (includes their own and chatted contacts)
  getAllStatuses: async (userId) => {
    return apiRequest(`/status/get/${userId}`, {
      method: 'GET',
    });
  },

  // Upload a new status
  uploadStatus: async (statusData) => {
    return apiRequest('/status/upload', {
      method: 'POST',
      body: JSON.stringify(statusData),
    });
  },

  // Upload media file (reusing chat upload endpoint)
  uploadMedia: async (file) => {
    const url = `${API_BASE_URL}/chat/upload/media`;
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || `Upload failed with status ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Upload Error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default statusAPI;
