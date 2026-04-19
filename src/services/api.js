/**
 * API Service - Centralized API client for all backend communications
 * Routes through API Gateway at http://localhost:8080
 */

const API_BASE_URL = 'http://localhost:8080/app/v1'

/**
 * Helper function to make API requests with JWT token
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log('API Request:', url, options.body ? JSON.parse(options.body) : '')
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    console.log('API Response Status:', response.status)
    
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth' // Simple redirect or state handling in App
      throw new Error('Token expired. Please login again.')
    }
    
    const data = await response.json()
    console.log('API Response Data:', data)
    
    if (!response.ok) {
      // Return full error object for specific handling like 403
      const error = new Error(data.message || data.error || `API Error: ${response.status}`)
      error.status = response.status
      error.data = data.data
      throw error
    }
    
    return data
  } catch (error) {
    console.error('API Request Error:', error.message)
    throw error
  }
}

/**
 * Authentication APIs
 */
export const authAPI = {
  register: async (username, email, password, firstName = "", lastName = "") => {
    return apiRequest('/user/create', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName
      }),
    })
  },

  verify: async (username, otp) => {
    return apiRequest('/user/verify', {
      method: 'PATCH',
      body: JSON.stringify({
        username,
        otp
      })
    })
  },

  resendOtp: async (username) => {
    return apiRequest(`/user/resend-otp?username=${encodeURIComponent(username)}`, {
      method: 'GET'
    })
  },

  login: async (username, password) => {
    return apiRequest('/public/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    })
  },

  logout: async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

/**
 * User Service APIs
 */
export const userAPI = {
  getProfile: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'GET',
    })
  },

  getProfileByUsername: async (username) => {
    return apiRequest(`/users/username/${username}`, {
      method: 'GET',
    })
  },

  getSettings: async (userId) => {
    return apiRequest(`/users/${userId}/config`, {
      method: 'GET',
    })
  },

  updateSettings: async (userId, settings) => {
    return apiRequest(`/users/${userId}/config`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },

  deactivate: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    })
  }
}

/**
 * Email Service APIs
 */
export const emailAPI = {
  getInbox: async (userId, page = 0, size = 20) => {
    return apiRequest(`/mail/inbox/${userId}?page=${page}&size=${size}&sort=receivedAt,desc`, {
      method: 'GET',
    })
  },

  getSentItems: async (userId) => {
    return apiRequest(`/mail/sent/${userId}`, {
      method: 'GET',
    })
  },

  getEmail: async (emailId) => {
    return apiRequest(`/mail/${emailId}`, {
      method: 'GET',
    })
  },

  verifyIntegrity: async (emailId) => {
    return apiRequest(`/mail/${emailId}/verify`, {
      method: 'GET',
    })
  },

  sendEmail: async (fromAddress, toAddress, subject, body, isHTML = false, cc = [], bcc = [], attachments = []) => {
    return apiRequest('/mail/send', {
      method: 'POST',
      body: JSON.stringify({
        fromAddress,
        toAddress,
        subject,
        body,
        cc,
        bcc,
        isHTML,
        attachments
      }),
    })
  },

  deleteEmail: async (emailId) => {
    return apiRequest(`/mail/${emailId}`, {
      method: 'DELETE',
    })
  },

  markAsRead: async (emailId) => {
    return apiRequest(`/mail/${emailId}/read`, {
      method: 'PATCH',
    })
  },

  verifyIntegrity: async (emailId) => {
    return apiRequest(`/mail/${emailId}/verify`, {
      method: 'GET'
    })
  }
}

/**
 * Health Check
 */
export const healthAPI = {
  checkGateway: async () => {
    try {
      const response = await fetch('http://localhost:8080/actuator/health')
      return response.ok
    } catch {
      return false
    }
  },
}

export default {
  authAPI,
  userAPI,
  emailAPI,
  healthAPI,
}
