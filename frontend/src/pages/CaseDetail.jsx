import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function CaseDetail({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pastedStatus, setPastedStatus] = useState('');
  const [historyLog, setHistoryLog] = useState([
    { date: "15 June 2026", text: "Case listed in Courtroom 3. Adjourned due to lack of time." }
  ]);

  const handleSync = (e) => {
    e.preventDefault();
    if (!pastedStatus.trim()) return;
    
    const newLog = {
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      text: pastedStatus
    };
    
    setHistoryLog([newLog, ...historyLog]);
    setPastedStatus('');
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/cases')} className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors">
        <ArrowLeft size={14} /> Back to Case Registry
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Hand: Option 3 - Manual Status Sync Form & Timeline */}
        <div className="space-y-6">
          <div className={`p-6 border rounded-xl ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-sm font-bold mb-1">Smart Status Parser</h2>
            <p className="text-xs text-zinc-400 mb-4">Paste the text block copied from eCourts to sync local file history logs.</p>
            
            <form onSubmit={handleSync} className="space-y-4">
              <textarea
                rows={4}
                value={pastedStatus}
                onChange={(e) => setPastedStatus(e.target.value)}
                placeholder="e.g., Next Hearing Date: 12/08/2026. Purpose: Admission Hearing..."
                className={`w-full p-3 text-xs rounded-lg border focus:outline-none transition-all resize-none ${
                  darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400'
                }`}
              />
              <button type="submit" className={`w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold rounded-lg text-white ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
                <RefreshCw size={12} /> Parse & Update History
              </button>
            </form>
          </div>

          {/* Local Timeline Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Case Timeline Logs</h3>
            <div className="space-y-3">
              {historyLog.map((log, index) => (
                <div key={index} className={`p-4 border rounded-xl text-xs ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="font-semibold text-zinc-400 mb-1">{log.date}</div>
                  <div className={darkMode ? 'text-zinc-200' : 'text-zinc-800'}>{log.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Option 2 - Live Portal Embed/Reference Panel */}
        <div className="flex flex-col h-[550px]">
          <div className={`p-4 border-t border-x rounded-t-xl flex items-center justify-between text-xs font-medium ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
            <span className="flex items-center gap-2 text-zinc-500"><Globe size={13} /> Secure eCourts Frame Portal</span>
            <a href="https://ecourts.gov.in" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Open External</a>
          </div>
          <div className={`flex-1 border rounded-b-xl overflow-hidden bg-white ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            {/* Embedded Iframe. Note: Some state portals block direct frame rendering, so we provide an interactive guide inside */}
            <iframe 
              src="https://ecourts.gov.in" 
              title="eCourts Portal Frame" 
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>

      </div>
    </div>
  );
}