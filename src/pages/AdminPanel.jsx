import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Search, 
  Trash2, 
  CheckSquare, 
  AlertCircle,
  FolderOpen,
  Filter
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports'
  
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userSearch, setUserSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all');

  const token = localStorage.getItem('token');

  const loadAdminData = () => {
    setLoading(true);
    
    // Fetch users (Admin authorized)
    fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(err => console.error("Error loading users:", err));

    // Fetch citizen reports
    fetch('http://127.0.0.1:8000/api/reports/list')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading reports:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleModerateReport = async (reportId, newStatus) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/reports/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_id: reportId,
          status: newStatus
        })
      });

      if (!res.ok) throw new Error('Moderation failed');

      // Reload
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  // Filter lists
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.reporter_name.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          r.description.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          r.category.toLowerCase().includes(reportSearch.toLowerCase());
    
    const matchesFilter = reportFilter === 'all' || r.status === reportFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher Headers */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <Users size={14} />
          <span>User Profiles ({users.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <FileText size={14} />
          <span>Citizen Reports ({reports.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500"></div>
        </div>
      ) : activeTab === 'users' ? (
        
        /* USERS LIST TABLE */
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Users size={16} className="text-sky-500" />
              <span>Registered Accounts</span>
            </h3>
            
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-850 text-slate-400">
                  <th className="p-3">Username</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 text-slate-700 dark:text-slate-300">
                    <td className="p-3 font-bold text-slate-850 dark:text-white">{u.username}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border capitalize ${
                        u.role === 'admin' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                        u.role === 'government' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        u.role === 'ngo' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* CITIZEN REPORTS MODERATION TABLE */
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
              <FileText size={16} className="text-sky-500" />
              <span>Issues Moderation Center</span>
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full sm:w-56 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer text-slate-850 dark:text-white"
              >
                <option value="all">Filter Status: All</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-850 text-slate-400">
                  <th className="p-3">Category</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredReports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 text-slate-700 dark:text-slate-300">
                    <td className="p-3 font-bold text-slate-850 dark:text-white capitalize">{r.category}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-450">{r.reporter_name}</td>
                    <td className="p-3 max-w-xs truncate" title={r.description}>{r.description}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border capitalize ${
                        r.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        r.status === 'investigating' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={r.status}
                        onChange={(e) => handleModerateReport(r._id, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Set Pending</option>
                        <option value="investigating">Set Investigating</option>
                        <option value="resolved">Set Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};

export default AdminPanel;
