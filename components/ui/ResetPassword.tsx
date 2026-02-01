import React, { useState } from 'react';
import * as api from '../../services/api';
import { Button } from './Button';
import { Loader, Key, AlertCircle, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  onShowLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onShowLogin }) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await api.resetPassword(token, password);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter the token from the console and your new password.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{message}</span>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input id="token" name="token" type="text" required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div>
              <input id="password" name="password" type="password" required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <input id="confirm-password" name="confirm-password" type="password" required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full group" disabled={isLoading}>
              {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Key className="w-5 h-5 mr-2" />}
              Reset Password
            </Button>
            <Button variant="ghost" type="button" className="w-full" onClick={onShowLogin}>
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
