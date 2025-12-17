import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase user object
 */
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Sign in an existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase user object
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get the currently signed-in user
 * @returns {User|null} Firebase user object or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get the ID token for the current user
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string|null>} ID token or null
 */
export const getIdToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
  return null;
};

/**
 * Listen for authentication state changes
 * @param {Function} callback - Callback function that receives the user object
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is signed in
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Get user email
 * @returns {string|null} User's email or null
 */
export const getUserEmail = () => {
  return auth.currentUser?.email || null;
};

/**
 * Get user UID
 * @returns {string|null} User's UID or null
 */
export const getUserUID = () => {
  return auth.currentUser?.uid || null;
};
