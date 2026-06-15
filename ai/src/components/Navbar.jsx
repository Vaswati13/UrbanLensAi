import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Database } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Informal Settlement GIS Map';
    if (path.includes('/analysis')) return 'Satellite AI Feature Detection';
    if (path.includes('/gaps')) return 'Infrastructure Gap Analysis';
    if (path.includes('/predictions')) return 'Predictive Risk Analytics';
    if (path.includes('/recommendations')) return 'AI Geo-Location Optimizer';
    if (path.includes('/reports')) return 'Citizen Action Hub';
    if (path.includes('/admin')) return 'Administrator Console';
    return 'Dashboard';
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 transition-colors duration-300">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{getPageTitle()}</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 hidden md:block">
          Welcome back, {user.username || 'Planner'} • Role: <span className="capitalize">{user.role}</span>
        </p>
      </div>

      {/* Action utilities */}
      <div className="flex items-center space-x-4">
        {/* DB Status Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Database size={12} />
          <span className="hidden sm:inline">Active Mode</span>
        </div>

        {/* Dark/Light Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full glow-animation"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
