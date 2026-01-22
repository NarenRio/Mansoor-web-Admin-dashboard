const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_data';

// Auth Service - Handles authentication tokens and admin data
export const authService = {
  // Set token and admin data
  setAuth: (token, admin) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get admin data
  getAdmin: () => {
    const adminData = localStorage.getItem(ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Clear auth data (logout)
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }
};

export default authService;
