import { createContext, useContext, useState } from 'react';

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
      uid: 'mock-uid-' + Date.now(),
      email,
      token: 'mock-jwt-token',
      role
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
      uid: 'mock-uid-existing',
      email,
      token: 'mock-jwt-token',
      role: 'player' // Mock existing user role
    };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
