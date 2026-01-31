// API Configuration
// API Configuration - uses environment variable for production
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...(options.body && { body: options.body })
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Authentication API calls
export const authAPI = {
  register: (userData) => 
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  verifyOTP: (email, otp) =>
    apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),
  
  login: (credentials) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  
  getCurrentUser: () =>
    apiCall('/api/auth/me')
}

// Default export for Profile and other components
const api = {
  get: (endpoint) => 
    apiCall(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) =>
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: (endpoint, data) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  delete: (endpoint) =>
    apiCall(endpoint, { method: 'DELETE' })
}

// College API calls
export const collegesAPI = {
  getAllColleges: () => apiCall('/api/colleges'),
  
  getCollegeByCode: (code) => apiCall(`/api/colleges/${code}`),
  
  searchColleges: (query) => apiCall(`/api/colleges/search/${query}`),
  
  getCollegeNames: () => apiCall('/api/colleges/collegeNames'),
  
  getCollegeInfo: (collegeCode) => apiCall('/api/colleges/collegeInfo', {
    method: 'POST',
    body: JSON.stringify({ college_code: collegeCode })
  })
}

export default api
