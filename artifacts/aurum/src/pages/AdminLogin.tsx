import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('aurum_admin_token', data.token);
        setLocation('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-12">
          <div className="font-serif text-[20px] font-medium tracking-[0.22em] mb-2 uppercase">Lowkey Wardrobe</div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999]">Admin Portal</p>
        </div>

        <div className="bg-white border border-[#EAEAEA] p-10">
          <h1 className="font-serif text-[24px] italic font-light mb-8">Sign In</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin username"
                className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-black"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-black py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[#999999] mt-6">
          <a href="/" className="hover:text-black transition-colors">← Back to Lowkey Wardrobe</a>
        </p>
      </motion.div>
    </div>
  );
}
