// Chat API service
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

export const chatAPI = {
  // Get messages for a chat room
  getMessages: async (chatRoomId) => {
    return apiRequest(`/chat/messages/${chatRoomId}`, {
      method: 'GET',
    });
  },

  // Get recent chat users
  getRecentChats: async (userId) => {
    return apiRequest(`/recent/chats/${userId}`, {
      method: 'GET',
    });
  },

  // Get all users (for starting new chat)
  getAllUsers: async (userId) => {
    return apiRequest(`/auth/all/users/${userId}`, {
      method: 'GET',
    });
  },

  // Upload media file to Cloudinary
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

// Helper function to generate chatRoomId (sorted alphabetically)
export const getChatRoomId = (userId1, userId2) => {
  if (userId1.localeCompare(userId2) <= 0) {
    return `${userId1}_${userId2}`;
  }
  return `${userId2}_${userId1}`;
};

export default chatAPI;
