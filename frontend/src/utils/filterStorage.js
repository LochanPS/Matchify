/**
 * Filter storage utility for persisting user preferences
 * Saves and retrieves tournament filter preferences from localStorage
 */

const STORAGE_KEY = 'tournament_filters';

/**
 * Save filters to localStorage
 * @param {Object} filters - Filter object to save
 */
export const saveFilters = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters:', error);
  }
};

/**
 * Get filters from localStorage
 * @returns {Object|null} Saved filters or null if none exist
 */
export const getFilters = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get filters:', error);
    return null;
  }
};

/**
 * Clear filters from localStorage
 */
export const clearFilters = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear filters:', error);
  }
};

export default {
  saveFilters,
  getFilters,
  clearFilters,
};
