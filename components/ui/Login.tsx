import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Button } from './Button.tsx';
import { Loader, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onShowForgotPassword: () => void;
  onShowResetPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onShowForgotPassword }) => {
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(id, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">PMO Suite</h1>
          <p className="mt-2 text-sm text-slate-500">Please sign in to continue</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="id" className="sr-only">Employee ID</label>
              <input
                id="id"
                name="id"
                type="text"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Employee ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button type="button" onClick={onShowForgotPassword} className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full group" disabled={isLoading}>
              {isLoading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};