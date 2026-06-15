import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, subtext, trend, color = 'sky', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Check if value is numeric for count up animation
    const num = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = num;
    if (start === end) return;

    const duration = 1.2; // seconds
    const increment = end / (duration * 60);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(value); // Set exact value including strings
      } else {
        setDisplayValue(
          end > 1000 
            ? Math.floor(start).toLocaleString() 
            : Math.floor(start)
        );
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    sky: {
      text: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/30',
      glow: 'shadow-sky-500/5',
    },
    emerald: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      text: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30',
      glow: 'shadow-amber-500/5',
    },
    rose: {
      text: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30',
      glow: 'shadow-rose-500/5',
    },
  };

  const style = colorStyles[color] || colorStyles.sky;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card p-6 flex items-start justify-between shadow-sm relative overflow-hidden border border-slate-200/60 dark:border-slate-800/40 ${style.glow}`}
    >
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          {title}
        </span>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {displayValue}
          </span>
        </div>
        {subtext && (
          <div className="flex items-center space-x-1.5 text-xs">
            {trend && (
              <span className={`font-semibold ${trend.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend}
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">{subtext}</span>
          </div>
        )}
      </div>

      <div className={`p-3 rounded-xl border ${style.bg} ${style.text} flex items-center justify-center shadow-inner`}>
        <Icon size={22} />
      </div>
    </motion.div>
  );
};

export default MetricCard;
