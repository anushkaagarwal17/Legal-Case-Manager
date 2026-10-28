import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  Briefcase, 
  User, 
  Calendar, 
  ExternalLink,
  Clock,
  Sparkles,
  CreditCard,
  Plus,
  Receipt,
  FileText
} from 'lucide-react';
import { getCase, addPayment, getPayments } from '../api';

export default function CaseDetail({ darkMode, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [pastedStatus, setPastedStatus] = useState('');
  const [historyLog, setHistoryLog] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Payment Modal
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const isClient = currentUser?.role === 'client';

  const loadCase = () => {
    getCase(id)
      .then(res => {
        const c = res.data;
        setCaseData(c);
        setPayments(c.payments || []);
        setHistoryLog([
          { date: "15 June 2026", text: "Case listed in Courtroom 3. Adjourned due to lack of time." },
          { date: "02 May 2026", text: "Notice issued to respondent. Written statement awaited." }
        ]);
      })
      .catch(err => {
        console.error(`[API ERROR] Failed to fetch case ${id}:`, err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [id]);

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

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payAmount) return;
    setPaySubmitting(true);

    try {
      await addPayment(id, {
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        reference_no: payRef || `PAY-${Date.now().toString().slice(-6)}`,
        notes: payNotes || 'Payment against case retainer'
      });
      setIsPayOpen(false);
      setPayAmount('');
      setPayRef('');
      setPayNotes('');
      loadCase();
    } catch (err) {
      console.error('[API ERROR] Failed to record payment:', err);
    } finally {
      setPaySubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Return Back Link */}
      <button 
        onClick={() => navigate('/cases')} 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Case Registry
      </button>

      {/* Case Header Banner Card */}
      {caseData && (
        <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60">
                {caseData.case_number}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {caseData.case_type} Classification
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {caseData.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5"><User size={13} /> Client: <strong className="text-slate-700 dark:text-slate-200">{caseData.client_name}</strong></span>
              {caseData.lawyer_name && <span className="flex items-center gap-1.5"><Briefcase size={13} /> Counsel: <strong className="text-slate-700 dark:text-slate-200">{caseData.lawyer_name}</strong></span>}
              {caseData.court && <span className="flex items-center gap-1.5"><Briefcase size={13} /> {caseData.court}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setIsPayOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus size={14} /> {isClient ? 'Make Payment' : 'Record Deposit'}
            </button>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-2xs ${
              caseData.status === 'Active' 
                ? 'bg-[#d1fae5] text-[#065f46]' 
                : 'bg-[#fef3c7] text-[#92400e]'
            }`}>
              {caseData.status}
            </span>
          </div>
        </div>
      )}

      {/* Financial Fee & Payment Status Card */}
      {caseData && (
        <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Fee Structure & Payment Status</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              caseData.payment_status === 'Paid' ? 'bg-[#d1fae5] text-[#065f46]' :
              caseData.payment_status === 'Partial' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#ffe4e6] text-[#9f1239]'
            }`}>
              {caseData.payment_status === 'Paid' ? 'Fully Cleared' : caseData.payment_status === 'Partial' ? 'Partial Payment' : 'Payment Pending'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1117] border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AGREED LEGAL FEE</div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">₹{(caseData.total_fee || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">AMOUNT PAID BY CLIENT</div>
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">₹{(caseData.paid_amount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">REMAINING BALANCE DUE</div>
              <div className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">₹{(caseData.remaining_balance || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Payment History Log */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Receipts</div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {payments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-[#0f1117]/40">
                    <div className="flex items-center gap-3">
                      <Receipt size={14} className="text-teal-600 dark:text-teal-400" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{p.amount.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 ml-2">via {p.payment_method}</span>
                        {p.reference_no && <span className="font-mono text-slate-400 ml-2">({p.reference_no})</span>}
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px]">{p.payment_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client's Matter Description / What the Client Wants */}
      {caseData?.client_notes && (
        <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isClient ? 'My Legal Relief Statement & Case Background' : 'What the Client Wants / Relief Sought'}
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1117] border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {caseData.client_notes}
          </div>
        </div>
      )}

      {/* Grid: Status Parser & Portal Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Smart Status Parser & Timeline Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Smart Status Parser</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Paste order sheet snippets or eCourts status updates to automatically update this case file history.
            </p>
            
            <form onSubmit={handleSync} className="space-y-3.5">
              <textarea
                rows={3}
                value={pastedStatus}
                onChange={(e) => setPastedStatus(e.target.value)}
                placeholder="e.g., Next Hearing Date: 12/08/2026. Purpose: Admission Hearing before Courtroom 4..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none shadow-2xs"
              />
              <button 
                type="submit" 
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-white bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw size={13} /> Parse & Append To Case Timeline
              </button>
            </form>
          </div>

          {/* Timeline Ledger */}
          <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Clock size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Case Proceedings Timeline</span>
            </h3>
            
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              {historyLog.map((log, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-8 top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white dark:border-[#131720] shadow-xs" />
                  
                  <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f1117]/80 text-xs">
                    <div className="font-semibold text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1.5">
                      <Calendar size={11} /> {log.date}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {log.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: eCourts Web Frame (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[600px] bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-medium bg-slate-50/80 dark:bg-slate-900/60">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
              <Globe size={14} className="text-teal-600 dark:text-teal-400" />
              <span>eCourts Live Portal Frame</span>
            </span>
            <a 
              href="https://ecourts.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Open External</span>
              <ExternalLink size={11} />
            </a>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <iframe 
              src="https://ecourts.gov.in" 
              title="eCourts Portal Frame" 
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>

      </div>

      {/* Record Payment Modal */}
      {isPayOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} className="text-teal-600 dark:text-teal-400" />
                <span>{isClient ? 'Submit Fee Payment' : 'Record Client Fee Deposit'}</span>
              </h3>
              <button onClick={() => setIsPayOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g., 10000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cash">Cash Deposit</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g., UPI-20261029-012"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="px-4 py-2 rounded-xl text-white bg-teal-600 hover:bg-teal-500 font-semibold"
                >
                  {paySubmitting ? 'Recording...' : 'Commit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
