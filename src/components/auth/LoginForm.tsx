import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
      toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      toast.error('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 space-y-6 bg-[#fdf0eb] rounded-xl shadow-md">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">HotSpoT</h1>
        <h2 className="text-xl text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-600">or <Link to="/register" className="text-blue-600 hover:underline">create an account</Link></p>
      </div>

      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-[#0E4F52] border border-[#0E4F52] hover:bg-[#156568] text-white"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 text-black border-[#0E4F52] focus-visible:ring-[#0E4F52] focus:border-[#0E4F52] placeholder:text-black"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 text-black border-[#0E4F52] focus-visible:ring-[#0E4F52] focus:border-[#0E4F52] placeholder:text-black"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="checkbox-teal"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember Me
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-black hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0E4F52] hover:bg-[#156568] text-white"
        >
          {loading ? 'Signing in...' : 'Log In'}
        </Button>
      </form>

      <div className="text-center">
        <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900">
          Create an Account
        </Link>
      </div>

      <div className="text-center text-sm text-gray-500">
        <Link to="/terms" className="text-gray-600 hover:underline">Terms of Service</Link>
        {' and '}
        <Link to="/privacy" className="text-gray-600 hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default LoginForm;
