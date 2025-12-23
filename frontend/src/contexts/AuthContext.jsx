import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock Firebase Auth (replace with actual Firebase in production)
const mockFirebaseAuth = {
  signup: async (email, password, role) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'error@test.com') {
      throw new Error('Email already exists');
    }
    
    return {
      user_id: 'mock-uid-' + Date.now(),
      email,
      token: 'mock-jwt-token',
      role,
      name: email.split('@')[0],
      city: null,
      onboarded: false
    };
  },
  
  login: async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'wrong@test.com') {
      throw new Error('Invalid email or password');
    }
    
    return {
      user_id: 'mock-uid-existing',
      email,
      token: 'mock-jwt-token',
      role: 'player',
      name: email.split('@')[0],
      city: 'Bangalore',
      onboarded: true
    };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to restore user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const signup = async (email, password, role) => {
    setLoading(true);
    try {
      const userData = await mockFirebaseAuth.signup(email, password, role);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await mockFirebaseAuth.login(email, password);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (profileData) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      // Call backend API to update profile
      const updatedUser = await userAPI.updateProfile(user.user_id, {
        city: profileData.city,
      });

      // Update local user state
      const newUser = {
        ...user,
        city: profileData.city,
        onboarded: true,
      };
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, completeProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
