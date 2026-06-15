import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Loader2, LogIn, Key, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userType) => {
    const credentials = {
      admin: { u: 'admin', p: 'admin123' },
      government: { u: 'government', p: 'govt123' },
      ngo: { u: 'ngo', p: 'ngo123' },
      citizen: { u: 'citizen', p: 'citizen123' },
    };

    const creds = credentials[userType];
    if (creds) {
      setUsername(creds.u);
      setPassword(creds.p);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-6 relative">
      <div className="absolute inset-0 satellite-grid pointer-events-none opacity-20 z-0"></div>
      
      {/* Brand Header */}
      <Link to="/" className="flex items-center space-x-3 mb-8 relative z-10">
        <div className="p-2.5 bg-sky-500 rounded-xl text-white">
          <Map size={22} className="glow-animation" />
        </div>
        <span className="font-extrabold text-xl tracking-wider">UrbanLens AI</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h2>
          <p className="text-slate-400 text-xs mt-1">Access geospatial mapper and gap analyzer</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Key size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold tracking-tight shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Enter Dashboard</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Quick fill panel */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase block mb-3 text-center">
            Demo Accounts (Single-Click Login)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {[
              { label: 'Admin Planner', role: 'admin', color: 'hover:border-sky-500 hover:text-sky-400' },
              { label: 'Authority', role: 'government', color: 'hover:border-emerald-500 hover:text-emerald-400' },
              { label: 'NGO Officer', role: 'ngo', color: 'hover:border-amber-500 hover:text-amber-400' },
              { label: 'Citizen', role: 'citizen', color: 'hover:border-slate-300 hover:text-slate-200' },
            ].map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => quickFill(account.role)}
                className={`py-2 px-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-400 transition-all text-left truncate cursor-pointer ${account.color}`}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="text-sky-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
