import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, FilePlus2, UserCheck, CreditCard } from 'lucide-react';
import { addCase, getLawyers } from '../api';

export default function AddCase({ darkMode, currentUser }) {
  const navigate = useNavigate();
  const isClient = currentUser?.role === 'client';

  const [lawyers, setLawyers] = useState([]);
  const [formData, setFormData] = useState({
    caseNo: '',
    clientName: isClient ? (currentUser?.name || '') : '',
    clientPhone: isClient ? (currentUser?.phone || '') : '',
    clientEmail: isClient ? (currentUser?.email || '') : '',
    title: '',
    type: 'Civil',
    status: 'Active',
    lawyerId: '',
    totalFee: '',
    paidAmount: '',
    clientNotes: '',
    court: 'District & Sessions Court'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getLawyers()
      .then(res => {
        const list = res.data || [];
        setLawyers(list);
        if (list.length > 0) {
          setFormData(prev => ({ ...prev, lawyerId: list[0].id }));
        }
      })
      .catch(err => console.error('[API ERROR] Failed to fetch lawyers:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        case_number: formData.caseNo || undefined,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail,
        title: formData.title,
        case_type: formData.type,
        status: isClient ? 'Active' : formData.status,
        court: formData.court,
        lawyer_id: formData.lawyerId ? parseInt(formData.lawyerId) : undefined,
        client_id: isClient ? currentUser?.id : undefined,
        total_fee: parseFloat(formData.totalFee || 0.0),
        paid_amount: parseFloat(formData.paidAmount || 0.0),
        client_notes: formData.clientNotes,
        description: formData.clientNotes
      };

      await addCase(payload);
      navigate('/cases');
    } catch (err) {
      console.error('[API ERROR] Failed to create case:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit case file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Return Back Link */}
      <div>
        <button 
          onClick={() => navigate('/cases')} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Return to Case Registry
        </button>
        <div className="mt-3">
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FilePlus2 className="text-teal-600 dark:text-teal-400" size={26} />
            <span>{isClient ? 'Submit New Matter Directly to Your Lawyer' : 'File New Case Record'}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isClient
              ? 'Provide your dispute or matter background and legal relief sought. Your assigned counsel will review and docket.'
              : 'Initialize legal matters, fee agreements, and tracking parameters into the docket.'}
          </p>
        </div>
      </div>

      {/* Styled Entry Card Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors"
      >
        {/* Lawyer Assignment & Client Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isClient ? 'Assigned Chamber Counsel *' : 'Assigned Handling Lawyer *'}
            </label>
            <select
              value={formData.lawyerId}
              onChange={(e) => setFormData({...formData, lawyerId: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer font-medium"
            >
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.specialization || 'Advocate'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Rajesh Sharma"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Case Title / Dispute Matter */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Case Title / Dispute Matter *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Sharma vs. State of Delhi or Property Demarcation Injunction"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
          />
        </div>

        {/* What the Client Wants / Relief Sought */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            {isClient ? 'What You Want Accomplished / Relief Sought (Describe your situation) *' : 'Client Relief Sought / Notes (What the client wants)'}
          </label>
          <textarea
            rows={4}
            required={isClient}
            placeholder="Describe what relief you are seeking from the court or lawyer (e.g., stay of demolition, recovery of pending payment of Rs. 14 lakhs, bail petition, dispute settlement)..."
            value={formData.clientNotes}
            onChange={(e) => setFormData({...formData, clientNotes: e.target.value})}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
          />
        </div>

        {/* Classification & Court Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Case Classification
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs"
            >
              <option value="Civil">Civil</option>
              <option value="Criminal">Criminal</option>
              <option value="Revenue">Revenue</option>
              <option value="Corporate">Corporate / Commercial</option>
              <option value="Family">Family / Matrimonial</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Court Forum / Venue
            </label>
            <input
              type="text"
              placeholder="e.g., District & Sessions Court, Agra"
              value={formData.court}
              onChange={(e) => setFormData({...formData, court: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Legal Fee & Initial Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-[#0f1117]/80 border border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard size={13} className="text-teal-600 dark:text-teal-400" />
              <span>{isClient ? 'Agreed / Estimated Legal Retainer (₹)' : 'Agreed Total Legal Fee (₹)'}</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 50000"
              value={formData.totalFee}
              onChange={(e) => setFormData({...formData, totalFee: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isClient ? 'Advance Deposit Paid (₹)' : 'Initial Amount Received (₹)'}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 20000 (leave 0 if paying later)"
              value={formData.paidAmount}
              onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-xs font-medium border bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Action Buttons Panel */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl text-white bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={14} /> {loading ? 'Submitting...' : isClient ? 'Submit Matter to Counsel' : 'Record Case File'}
          </button>
        </div>
      </form>
    </div>
  );
}
