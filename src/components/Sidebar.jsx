import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ScanEye, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  LogOut,
  Map
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', end: true, label: 'GIS Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/analysis', label: 'Satellite AI Analysis', icon: ScanEye },
    { to: '/dashboard/gaps', label: 'Infrastructure Gaps', icon: MapPin },
    { to: '/dashboard/predictions', label: 'Predictive Risk', icon: TrendingUp },
    { to: '/dashboard/recommendations', label: 'AI Place Optimization', icon: Sparkles },
    { to: '/dashboard/reports', label: 'Citizen Reporting', icon: AlertTriangle },
  ];

  if (user.role === 'admin') {
    navItems.push({ to: '/dashboard/admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
        <div className="p-2 bg-sky-500 rounded-lg text-white">
          <Map size={20} className="glow-animation" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-wider">UrbanLens AI</h1>
          <p className="text-xs text-sky-400 font-medium tracking-tight">Settlement Mapper</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                  <span>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* User profile footer info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center space-x-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 border border-slate-700">
            {user.username ? user.username.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{user.username || 'User'}</h2>
            <p className="text-xs text-slate-400 truncate capitalize">{user.role || 'Citizen'}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
