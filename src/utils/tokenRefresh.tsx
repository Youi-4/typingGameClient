import axios from 'axios';

/**
 * Token Refresh Utility
 * 
 * Automatically refreshes the JWT token before it expires.
 * Call setupTokenRefresh() after successful login.
 */

let refreshInterval: number | null = null;

/**
 * Refresh the authentication token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    
    if (response.data.success) {
      console.log('Token refreshed successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Setup automatic token refresh
 * Refreshes token every 6 days (token expires in 7 days)
 */
export const setupTokenRefresh = () => {
  // Clear existing interval if any
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Refresh every 6 days (token expires in 7 days)
  const refreshIntervalMs = 6 * 24 * 60 * 60 * 1000; // 6 days
  
  refreshInterval = setInterval(async () => {
    const success = await refreshAuthToken();
    
    if (!success) {
      // If refresh fails, clear interval and user will be logged out
      clearTokenRefresh();
    }
  }, refreshIntervalMs);

  console.log('Token auto-refresh enabled (every 6 days)');
};

/**
 * Clear the token refresh interval
 * Call this on logout
 */
export const clearTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Token auto-refresh disabled');
  }
};

/**
 * Manually trigger a token refresh
 * Useful to call this on app startup if user is already logged in
 */
export const manualTokenRefresh = async (): Promise<boolean> => {
  return await refreshAuthToken();
};
