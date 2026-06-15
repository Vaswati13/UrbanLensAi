import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', delay = 0, title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-6 border border-slate-200/60 dark:border-slate-800/40 relative ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
