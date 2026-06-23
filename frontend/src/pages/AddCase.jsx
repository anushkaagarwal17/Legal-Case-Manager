import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddCase({ darkMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    caseNo: '',
    clientName: '',
    title: '',
    type: 'Civil',
    status: 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Verification handling can be attached here
    console.log("New Case Form Submission Data:", formData);
    navigate('/cases');
  };

  return (
    <div className="space-y-6">
      {/* Return Back Control Header */}
      <div>
        <button 
          onClick={() => navigate('/cases')} 
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft size={14} /> Return to Case Registry
        </button>
        <h1 className={`text-2xl font-bold tracking-tight mt-3 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          File New Case Records
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Initialize legal files directly inside the local database index.
        </p>
      </div>

      {/* Styled Entry Card Form Element */}
      <form 
        onSubmit={handleSubmit} 
        className={`border rounded-xl p-6 md:p-8 space-y-6 transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800 shadow-none' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Case File Identifier */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Case Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g., OS/104/2026"
              value={formData.caseNo}
              onChange={(e) => setFormData({...formData, caseNo: e.target.value})}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                darkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
              }`}
            />
          </div>

          {/* Client Reference Name */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Client Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Varsha Sapra"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                darkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
              }`}
            />
          </div>
        </div>

        {/* Title Subject Matter */}
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Case Title / Matter Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Property Title Dispute Claims and Assessments"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
              darkMode 
                ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
              }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classification Selection */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Case Type Classification
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none cursor-pointer transition-all ${
                darkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
              }`}
            >
              <option value="Civil" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Civil</option>
              <option value="Criminal" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Criminal</option>
              <option value="Revenue" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Revenue</option>
            </select>
          </div>

          {/* Registry Status */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Initial System Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none cursor-pointer transition-all ${
                darkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
              }`}
            >
              <option value="Active" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Active</option>
              <option value="Disposed" className={darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>Disposed</option>
            </select>
          </div>
        </div>

        {/* Action Options Button Panel */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              darkMode ? 'text-zinc-400 hover:text-white bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 rounded-lg text-white shadow-sm transition-colors ${
              darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            <Save size={14} /> Record Case File
          </button>
        </div>
      </form>
    </div>
  );
}