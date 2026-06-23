import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const SAMPLE_CASES = [
  { id: 1, case_no: "CS/2401/2025", title: "Commercial Contract Breach Settlement", client: "Acme Corp Ltd", type: "Civil", status: "Active" },
  { id: 2, case_no: "CRM/412/2026", title: "Intellectual Property Trespass Claims", client: "Varsha Sapra", type: "Criminal", status: "Active" },
  { id: 3, case_no: "REV/902/2024", title: "Agricultural Land Assessment Appeal", client: "Jyoshita Sapra", type: "Revenue", status: "Disposed" },
  { id: 4, case_no: "CS/1150/2026", title: "Tenant Eviction & Non-Payment Suit", client: "Rajesh Kumar", type: "Civil", status: "Active" }
];

export default function Cases({ darkMode }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Simple clean filter logic
  const filteredCases = SAMPLE_CASES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.case_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            Case Registry
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Search and manage your firm's complete file archive.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-case')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            darkMode ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          <Plus size={14} /> Add Case File
        </button>
      </div>

      {/* Filter Action Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search by case no, title, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
              darkMode 
                ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
            }`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`w-full px-4 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer transition-all ${
            darkMode 
              ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600' 
              : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-400'
          }`}
        >
          <option value="All" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>All Statuses</option>
          <option value="Active" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Active Only</option>
          <option value="Disposed" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Disposed Only</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`w-full px-4 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer transition-all ${
            darkMode 
              ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600' 
              : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-400'
          }`}
        >
          <option value="All" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>All Classifications</option>
          <option value="Civil" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Civil</option>
          <option value="Criminal" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Criminal</option>
          <option value="Revenue" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Revenue</option>
        </select>
      </div>

      {/* Data Results Grid Layout */}
      {filteredCases.length === 0 ? (
        <div className={`text-center py-16 border border-dashed rounded-xl ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <p className="text-sm text-zinc-400">No active records matched your search parameters.</p>
        </div>
      ) : (
        <div className={`border rounded-xl overflow-hidden transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase tracking-wider ${
                  darkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                }`}>
                  <th className="px-6 py-3">Case Number</th>
                  <th className="px-6 py-3">Title / Matter</th>
                  <th className="px-6 py-3">Client Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'}`}>
                {filteredCases.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => navigate(`/case/${item.id}`)}
                    className={`transition-colors cursor-pointer ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50/80'}`}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-zinc-400">{item.case_no}</td>
                    <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{item.title}</td>
                    <td className="px-6 py-4">{item.client}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        item.status === 'Active' ? 'bg-zinc-900 text-zinc-100 border border-zinc-700' : 'bg-zinc-200 text-zinc-600'
                      }`}>{item.status}</span>
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
}