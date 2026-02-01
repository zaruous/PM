import React, { useState } from 'react';
import * as api from '../../services/api';
import { Button } from './Button';
import { Loader, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onShowLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onShowLogin }) => {
  const [id, setId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(id);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your Employee ID to reset your password.</p>
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
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full group" disabled={isLoading}>
              {isLoading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Send Reset Token
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
