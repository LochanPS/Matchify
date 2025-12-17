import { useEffect, useState } from 'react';
import { auth } from './firebase/config';
import { signUp, signIn, logOut, getIdToken } from './firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log('✅ User signed in:', currentUser.email);
        // Get token when user signs in
        currentUser.getIdToken().then(token => {
          setToken(token);
          console.log('🔑 ID Token:', token.substring(0, 50) + '...');
        });
      } else {
        console.log('❌ No user signed in');
        setToken('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignup = async () => {
    try {
      setMessage('Creating account...');
      const newUser = await signUp(testEmail, testPassword);
      setMessage(`✅ Signup successful! User: ${newUser.email}`);
      console.log('Signup successful:', newUser);
    } catch (error) {
      setMessage(`❌ Signup error: ${error.message}`);
      console.error('Signup error:', error);
    }
  };

  const handleSignin = async () => {
    try {
      setMessage('Signing in...');
      const signedInUser = await signIn(testEmail, testPassword);
      setMessage(`✅ Sign in successful! User: ${signedInUser.email}`);
      console.log('Sign in successful:', signedInUser);
    } catch (error) {
      setMessage(`❌ Sign in error: ${error.message}`);
      console.error('Sign in error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setMessage('Logging out...');
      await logOut();
      setMessage('✅ Logged out successfully');
      console.log('Logout successful');
    } catch (error) {
      setMessage(`❌ Logout error: ${error.message}`);
      console.error('Logout error:', error);
    }
  };

  const testProtectedRoute = async () => {
    try {
      setMessage('Testing protected route...');
      const token = await getIdToken();
      
      if (!token) {
        setMessage('❌ No token available. Please sign in first.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Protected route success! User: ${data.user.name}`);
        console.log('Protected route response:', data);
      } else {
        setMessage(`❌ Protected route failed: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Protected route error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏸 Pathfinder Enhanced</h1>
        <p>Loading Firebase...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🏸 Pathfinder Enhanced</h1>
      <h2>Firebase Authentication Test</h2>
      
      <div style={{ 
        padding: '15px', 
        background: user ? '#d4edda' : '#f8d7da', 
        border: `1px solid ${user ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {user ? `✅ Signed in as ${user.email}` : '❌ Not signed in'}
      </div>

      {!user ? (
        <div style={{ marginBottom: '20px' }}>
          <h3>Sign Up / Sign In</h3>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button 
            onClick={handleSignup}
            style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}
          >
            Sign Up
          </button>
          <button 
            onClick={handleSignin}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h3>Authenticated Actions</h3>
          <button 
            onClick={testProtectedRoute}
            style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Test Protected Route
          </button>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      )}

      {message && (
        <div style={{ 
          padding: '10px', 
          background: '#e7f3ff', 
          border: '1px solid #b3d9ff',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          {message}
        </div>
      )}

      {token && (
        <div style={{ marginTop: '20px' }}>
          <h4>ID Token (for API calls):</h4>
          <textarea 
            readOnly 
            value={token}
            style={{ width: '100%', height: '100px', fontFamily: 'monospace', fontSize: '10px' }}
          />
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h4>Setup Instructions:</h4>
        <ol style={{ textAlign: 'left', fontSize: '14px' }}>
          <li>Create Firebase project at console.firebase.google.com</li>
          <li>Enable Email/Password authentication</li>
          <li>Get web app credentials and update frontend/.env</li>
          <li>Download service account JSON for backend</li>
          <li>Restart both servers</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
