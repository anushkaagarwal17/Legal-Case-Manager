import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Briefcase, Filter, ArrowUpDown } from 'lucide-react';
import { getCases } from '../api';

export default function Cases({ darkMode }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases()
      .then(res => {
        setCases(res.data || []);
      })
      .catch(err => console.error('[API ERROR] Failed to fetch cases:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.case_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesType = typeFilter === 'All' || c.case_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return 'bg-[#d1fae5] text-[#065f46]';
    }
    if (status === 'Disposed') {
      return 'bg-[#e0e7ff] text-[#3730a3]';
    }
    return 'bg-[#fef3c7] text-[#92400e]';
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">
            Case Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, and manage your litigation docket archives.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-case')}
          className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} /> Add Case File
        </button>
      </div>

      {/* Filter Action Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="relative sm:col-span-6 lg:col-span-6">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by case no, title, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs placeholder:text-slate-400"
          />
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Disposed">Disposed Only</option>
          </select>
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all shadow-2xs"
          >
            <option value="All">All Classifications</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Revenue">Revenue</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase size={16} className="text-teal-600 dark:text-teal-400" />
            <span>Master Case Docket</span>
            <span className="text-xs font-normal text-slate-400">({filteredCases.length} records)</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading cases registry...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-14 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No cases matching your criteria
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'All' || typeFilter !== 'All'
                ? "Try adjusting your search terms or clearing filters."
                : "Your docket is currently empty. Add your first case file to begin tracking."}
            </p>
            <button
              onClick={() => navigate('/add-case')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline pt-1"
            >
              <Plus size={13} /> Add New Case File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">CASE NUMBER</th>
                  <th className="py-3 px-4">TITLE / MATTER</th>
                  <th className="py-3 px-4">CLIENT NAME</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredCases.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/case/${item.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono font-medium text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.case_number}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {item.client_name}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {item.case_type}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wide capitalize shadow-2xs ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
