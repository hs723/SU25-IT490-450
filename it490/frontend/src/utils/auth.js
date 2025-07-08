// Check if user is logged in
export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('userData') !== null;
};

// Get current user data
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('isLoggedIn');
  console.log('User logged out');
};

// Update user data
export const updateUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('isLoggedIn', 'true');
};

// Get user's display name
export const getUserDisplayName = () => {
  const user = getCurrentUser();
  return user ? user.name : 'Guest';
};

// Check if user has specific permissions (for future use)
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && user.permissions && user.permissions.includes(permission);
};