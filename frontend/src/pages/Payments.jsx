import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  X, 
  Receipt, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { getCases, addPayment, getPaymentSummary } from '../api';

export default function Payments({ darkMode, currentUser }) {
  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState({ total_billed: 0, total_paid: 0, total_due: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Payment Recording Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isClient = currentUser?.role === 'client';

  const fetchData = () => {
    setLoading(true);
    const params = isClient ? { role: 'client', user_id: currentUser?.id } : {};

    Promise.all([
      getCases(params),
      getPaymentSummary(params)
    ])
      .then(([casesRes, summaryRes]) => {
        setCases(casesRes.data || []);
        setSummary(summaryRes.data || { total_billed: 0, total_paid: 0, total_due: 0 });
      })
      .catch(err => console.error('[API ERROR] Failed to fetch payments data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedCaseId || !paymentAmount) return;

    setSubmitting(true);
    setError('');

    try {
      await addPayment(selectedCaseId, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference_no: paymentRef || `TXN-${Date.now().toString().slice(-6)}`,
        notes: paymentNotes || (isClient ? 'Client digital payment' : 'Chamber payment receipt')
      });

      setIsModalOpen(false);
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentNotes('');
      fetchData();
    } catch (err) {
      console.error('[API ERROR] Payment failed:', err);
      setError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.case_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'bg-[#d1fae5] text-[#065f46]';
    if (status === 'Partial') return 'bg-[#fef3c7] text-[#92400e]';
    return 'bg-[#ffe4e6] text-[#9f1239]';
  };

  return (
    <div className="space-y-7">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="text-teal-600 dark:text-teal-400" size={26} />
            <span>{isClient ? 'My Legal Fee & Payment Ledger' : 'Chamber Financial & Fee Ledger'}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isClient 
              ? 'Track your retainer fees, amounts cleared, and remaining balance due to your assigned lawyer.'
              : 'Complete litigation accounts overview: fees billed, collections, and pending balances.'}
          </p>
        </div>

        <button
          onClick={() => {
            if (cases.length > 0) setSelectedCaseId(cases[0].id);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} /> {isClient ? 'Submit Fee Payment' : 'Record Payment / Deposit'}
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Billed */}
        <div className="bg-[#f0f7fa] dark:bg-[#111e28]/70 border border-[#cde2ec] dark:border-cyan-900/40 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isClient ? 'TOTAL AGREED LEGAL FEE' : 'TOTAL FEES BILLED'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#dcebf2] text-[#486b7f] dark:bg-cyan-950/80 dark:text-cyan-300 flex items-center justify-center">
              <Receipt size={17} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white">
            ₹{summary.total_billed.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {cases.length} litigation matter(s)
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-[#eef9f2] dark:bg-[#0d2217]/70 border border-[#c2ebd0] dark:border-emerald-900/40 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isClient ? 'AMOUNT ALREADY PAID' : 'TOTAL AMOUNT COLLECTED'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#d4f2e0] text-[#2e9e62] dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
            ₹{summary.total_paid.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-medium">
            Cleared via UPI / Bank Deposit
          </p>
        </div>

        {/* Balance Remaining */}
        <div className="bg-[#fff1f2] dark:bg-[#291116]/70 border border-[#fecdd3] dark:border-rose-900/40 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isClient ? 'REMAINING BALANCE DUE' : 'TOTAL OUTSTANDING BALANCE'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-rose-700 dark:text-rose-400">
            ₹{summary.total_due.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            {summary.total_due > 0 ? 'Pending case retainer balance' : 'All accounts settled'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="relative sm:col-span-8">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by case no, title, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Payment States</option>
            <option value="Paid">Fully Paid Only</option>
            <option value="Partial">Partial Payments</option>
            <option value="Pending">Payment Pending</option>
          </select>
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt size={16} className="text-teal-600 dark:text-teal-400" />
            <span>Litigation Fee Accounts</span>
            <span className="text-xs font-normal text-slate-400">({filteredCases.length} matters)</span>
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading fee records...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-14 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No payment records found</p>
            <p className="text-xs text-slate-400">There are no cases matching the filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">CASE / MATTER</th>
                  <th className="py-3 px-4">CLIENT NAME</th>
                  <th className="py-3 px-4 text-right">TOTAL FEE</th>
                  <th className="py-3 px-4 text-right">AMOUNT PAID</th>
                  <th className="py-3 px-4 text-right">REMAINING DUE</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-mono font-medium text-slate-500 dark:text-slate-400">{item.case_number}</div>
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">{item.title}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {item.client_name}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ₹{(item.total_fee || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{(item.paid_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      ₹{(item.remaining_balance || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${getStatusBadge(item.payment_status)}`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedCaseId(item.id);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline px-2 py-1 rounded cursor-pointer"
                      >
                        <Plus size={12} /> {isClient ? 'Pay' : 'Add Deposit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} className="text-teal-600 dark:text-teal-400" />
                <span>{isClient ? 'Submit Legal Fee Payment' : 'Record Client Fee Payment'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Select Case File *</label>
                <select
                  required
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} — {c.title} (Due: ₹{(c.remaining_balance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g., 15000"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">NEFT / RTGS Transfer</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Transaction Reference / UTR No.</label>
                <input
                  type="text"
                  placeholder="e.g., UPI-20261029-99410 or CHQ-002145"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g., Advance for evidence filing stage"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold rounded-xl text-white bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : isClient ? 'Submit Payment Confirmation' : 'Commit Payment to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
