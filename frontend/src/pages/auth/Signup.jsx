import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <p className="text-center text-muted-foreground">
          Signup page - Coming on Day 12
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full h-button bg-primary text-primary-foreground rounded-md"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
