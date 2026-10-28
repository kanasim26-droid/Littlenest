import React, { useState } from 'react';
import { api } from '../../services/api';
import { Shield, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.loginAdmin(password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-14 h-14 bg-white border border-[#E8DCCB] rounded-2xl flex items-center justify-center mx-auto text-[#5A463C] shadow-xs mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-center text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Little Nest Admin
        </h2>
        <p className="mt-1 text-center text-xs text-[#8A7569]">
          Store owner management dashboard & dropshipping control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-[#E8DCCB] sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                Store Owner Access Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                />
              </div>
              <div className="mt-2 p-2.5 rounded-lg bg-[#FAF3EB] border border-[#E8DCCB] text-[11px] text-[#665449] flex items-center justify-between">
                <span>Default setup password:</span>
                <code className="font-mono font-semibold text-[#5A463C] px-1.5 py-0.5 bg-white rounded border border-[#E8DCCB]">
                  nest2026
                </code>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#5A463C] text-white text-xs font-semibold hover:bg-[#43332B] transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8DCCB] text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-[#8A7569] hover:text-[#4A3B32] transition-colors"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
