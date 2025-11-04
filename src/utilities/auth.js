/**
 * Authentication and Authorization Utilities
 */

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Check if user is admin (staff or superuser)
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user ? (user.is_admin || user.is_staff || user.is_superuser) : false;
};

/**
 * Check if user is superuser
 * @returns {boolean}
 */
export const isSuperUser = () => {
  const user = getCurrentUser();
  return user ? user.is_superuser === true : false;
};

/**
 * Check if user is staff
 * @returns {boolean}
 */
export const isStaff = () => {
  const user = getCurrentUser();
  return user ? user.is_staff === true : false;
};

/**
 * Get user role display name
 * @returns {string}
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return 'Guest';
  if (user.is_superuser) return 'Super Admin';
  if (user.is_staff) return 'Admin';
  return 'User';
};

/**
 * Save user data to localStorage
 * @param {Object} userData - User data object
 */
export const saveUserData = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Check if user has permission to create/edit/delete entities
 * @returns {boolean}
 */
export const canManageContent = () => {
  return isAdmin();
};

/**
 * Check if user can access admin routes
 * @returns {boolean}
 */
export const canAccessAdminRoutes = () => {
  return isAdmin();
};
