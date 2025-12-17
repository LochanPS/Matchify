import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <p className="text-center text-muted-foreground">
          Login page - Coming on Day 12
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="w-full h-button bg-primary text-primary-foreground rounded-md"
        >
          Go to Signup
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full h-button bg-secondary text-secondary-foreground rounded-md"
        >
          View as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
