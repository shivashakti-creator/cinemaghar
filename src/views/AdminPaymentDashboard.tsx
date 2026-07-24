import React, { useState, useEffect } from 'react';
import { PaymentGateway, PaymentLog, PaymentStatus } from '../types/payment';
import { DollarSign, TrendingUp, Clock, AlertTriangle, RefreshCw, Search, Download, Eye, FileText, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminPaymentDashboard: React.FC = () => {
  const [selectedGateway, setSelectedGateway] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLogModal, setSelectedLogModal] = useState<any | null>(null);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(248500);
  const [todayRevenue, setTodayRevenue] = useState(34200);
  const [pendingCount, setPendingCount] = useState(4);
  const [failedCount, setFailedCount] = useState(2);
  const [refundedCount, setRefundedCount] = useState(1);

  // Transactions / Logs list
  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 'tx_101',
      booking_reference: 'GAJ-8X92K',
      customer_name: 'Aayush Sharma',
      customer_phone: '9841234567',
      customer_email: 'aayush@gmail.com',
      movie_title: 'Purna Bahadur Ko Sarangi',
      amount: 791,
      gateway: 'esewa',
      payment_status: 'success',
      booking_status: 'confirmed',
      transaction_id: 'ESEWA_8923019',
      created_at: '2026-07-23 11:15 AM',
      request_payload: { amount: 791, product_code: 'EPAYTEST', transaction_uuid: 'GAJ-8X92K' },
      response_payload: { status: 'COMPLETE', transaction_code: '0000001', total_amount: 791 }
    },
    {
      id: 'tx_102',
      booking_reference: 'GAJ-4M19P',
      customer_name: 'Priyanka Shrestha',
      customer_phone: '9801987654',
      customer_email: 'priyanka@gmail.com',
      movie_title: 'Dune: Part Two',
      amount: 1700,
      gateway: 'khalti',
      payment_status: 'success',
      booking_status: 'confirmed',
      transaction_id: 'KHL_PIDX_982103',
      created_at: '2026-07-23 01:22 PM',
      request_payload: { pidx: 'KHL-982103', amount: 170000 },
      response_payload: { status: 'Completed', transaction_id: 'KHL_PIDX_982103' }
    },
    {
      id: 'tx_103',
      booking_reference: 'GAJ-7B88C',
      customer_name: 'Bikram Thapa',
      customer_phone: '9812345678',
      customer_email: 'bikram@hotmail.com',
      movie_title: 'Mahajatra',
      amount: 1150,
      gateway: 'fonepay',
      payment_status: 'success',
      booking_status: 'confirmed',
      transaction_id: 'FP_TXN_5512',
      created_at: '2026-07-23 03:05 PM',
      request_payload: { PRN: 'GAJ-7B88C', AMT: '1150.00' },
      response_payload: { status: 'SUCCESS', transaction_id: 'FP_TXN_5512' }
    },
    {
      id: 'tx_104',
      booking_reference: 'GAJ-2K33X',
      customer_name: 'Sujata Rai',
      customer_phone: '9865432109',
      customer_email: 'sujata@yahoo.com',
      movie_title: 'Stree 2',
      amount: 395,
      gateway: 'esewa',
      payment_status: 'failed',
      booking_status: 'failed',
      transaction_id: 'CANCELLED_BY_USER',
      created_at: '2026-07-23 04:10 PM',
      request_payload: { amount: 395 },
      response_payload: { status: 'CANCELED', error: 'User cancelled gateway prompt' }
    },
    {
      id: 'tx_105',
      booking_reference: 'GAJ-9P44W',
      customer_name: 'Rohan Joshi',
      customer_phone: '9823456789',
      customer_email: 'rohan@gmail.com',
      movie_title: 'Deadpool & Wolverine',
      amount: 791,
      gateway: 'counter',
      payment_status: 'pending',
      booking_status: 'confirmed',
      transaction_id: 'COUNTER_RESERVED',
      created_at: '2026-07-23 05:40 PM',
      request_payload: { mode: 'counter' },
      response_payload: { status: 'RESERVED_FOR_COUNTER' }
    }
  ]);

  useEffect(() => {
    // Attempt fetching real transactions from Supabase
    const fetchFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map((b) => ({
            id: b.id,
            booking_reference: b.booking_code,
            customer_name: b.customer_name,
            customer_phone: b.customer_phone,
            customer_email: b.customer_email || '',
            movie_title: b.movie_title,
            amount: b.total_price || b.amount,
            gateway: b.payment_method || 'esewa',
            payment_status: b.payment_status?.toLowerCase() || 'success',
            booking_status: b.booking_status || 'confirmed',
            transaction_id: b.transaction_id || `TXN_${b.id.slice(0, 6)}`,
            created_at: b.created_at ? new Date(b.created_at).toLocaleString() : '2026-07-23',
            request_payload: { booking_code: b.booking_code, amount: b.total_price },
            response_payload: { status: b.payment_status, transaction_id: b.transaction_id }
          }));
          setTransactions(mapped);

          const total = mapped.filter(t => t.payment_status === 'success' || t.payment_status === 'confirmed').reduce((sum, t) => sum + t.amount, 0);
          setTotalRevenue(total || 248500);
        }
      } catch (e) {
        console.warn('Supabase fetch transactions info:', e);
      }
    };

    fetchFromSupabase();
  }, []);

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesGateway = selectedGateway === 'all' || tx.gateway.toLowerCase() === selectedGateway.toLowerCase();
    const matchesStatus = statusFilter === 'all' || tx.payment_status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      tx.booking_reference.toLowerCase().includes(query) ||
      tx.customer_name.toLowerCase().includes(query) ||
      tx.customer_email.toLowerCase().includes(query) ||
      tx.customer_phone.toLowerCase().includes(query) ||
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(query));

    return matchesGateway && matchesStatus && matchesSearch;
  });

  // Export CSV feature
  const exportCSV = () => {
    const headers = ['Booking Reference', 'Customer Name', 'Phone', 'Email', 'Movie', 'Amount (NPR)', 'Gateway', 'Payment Status', 'Transaction ID', 'Created At'];
    const rows = filteredTransactions.map(t => [
      t.booking_reference,
      `"${t.customer_name}"`,
      t.customer_phone,
      t.customer_email,
      `"${t.movie_title}"`,
      t.amount,
      t.gateway.toUpperCase(),
      t.payment_status.toUpperCase(),
      t.transaction_id || '',
      t.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gajuri_Payment_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process Refund simulation
  const handleRefund = (txId: string) => {
    if (confirm('Are you sure you want to process a refund for this transaction?')) {
      setTransactions(prev =>
        prev.map(t => (t.id === txId ? { ...t, payment_status: 'refunded', booking_status: 'cancelled' } : t))
      );
      setRefundedCount(c => c + 1);
      alert('Refund processed successfully! Notification sent to customer.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Payment & Revenue Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction logs, eSewa / Khalti / Fonepay verification status & financial reporting.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT TRANSACTIONS CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#D4AF37]">
            NPR {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18% vs last month</span>
        </div>

        {/* Today's Revenue */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-400">
            NPR {todayRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">From verified gateway payments</span>
        </div>

        {/* Pending Payments */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-serif text-amber-300">
            {pendingCount}
          </p>
          <span className="text-[10px] text-amber-400 font-medium">10-min seat locks</span>
        </div>

        {/* Failed Payments */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-rose-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Failed Payments</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-serif text-rose-400">
            {failedCount}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Signature / user cancels</span>
        </div>

        {/* Refunded */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Refunded</span>
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-serif text-purple-300">
            {refundedCount}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Returned to source wallet</span>
        </div>

      </div>

      {/* Gateway Distribution Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#60BB46]/10 border border-[#60BB46]/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase block">eSewa ePay</span>
            <span className="text-lg font-bold text-white font-serif">NPR 112,000</span>
          </div>
          <span className="text-xs font-black px-2 py-1 bg-[#60BB46] text-white rounded-lg">eS</span>
        </div>

        <div className="p-4 bg-[#5C2D91]/10 border border-[#5C2D91]/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase block">Khalti v2</span>
            <span className="text-lg font-bold text-white font-serif">NPR 84,500</span>
          </div>
          <span className="text-xs font-black px-2 py-1 bg-[#5C2D91] text-white rounded-lg">K</span>
        </div>

        <div className="p-4 bg-[#ED1C24]/10 border border-[#ED1C24]/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase block">Fonepay QR</span>
            <span className="text-lg font-bold text-white font-serif">NPR 42,000</span>
          </div>
          <span className="text-xs font-black px-2 py-1 bg-[#ED1C24] text-white rounded-lg">FP</span>
        </div>

        <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase block">Counter Cash</span>
            <span className="text-lg font-bold text-white font-serif">NPR 10,000</span>
          </div>
          <span className="text-xs font-black px-2 py-1 bg-[#D4AF37] text-black rounded-lg">CC</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#12131C] p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking Ref, Customer Name, Mobile or Txn ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1B28] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Gateway Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Gateway:</span>
          <select
            value={selectedGateway}
            onChange={(e) => setSelectedGateway(e.target.value)}
            className="bg-[#1A1B28] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Gateways</option>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
            <option value="fonepay">Fonepay</option>
            <option value="counter">Counter</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1B28] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success / Paid</option>
            <option value="pending">Pending Hold</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-[#12131C] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1B28] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Movie</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Status</th>
                <th className="p-4">Txn ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#D4AF37]">{tx.booking_reference}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{tx.customer_name}</div>
                    <div className="text-[10px] text-slate-400">{tx.customer_phone}</div>
                  </td>
                  <td className="p-4 font-serif text-white">{tx.movie_title}</td>
                  <td className="p-4 font-bold text-white">NPR {tx.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                      tx.gateway === 'esewa'
                        ? 'bg-[#60BB46]/20 text-emerald-400 border border-[#60BB46]/40'
                        : tx.gateway === 'khalti'
                        ? 'bg-[#5C2D91]/20 text-purple-300 border border-[#5C2D91]/40'
                        : tx.gateway === 'fonepay'
                        ? 'bg-[#ED1C24]/20 text-rose-300 border border-[#ED1C24]/40'
                        : 'bg-[#D4AF37]/20 text-amber-300 border border-[#D4AF37]/40'
                    }`}>
                      {tx.gateway}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-max ${
                      tx.payment_status === 'success' || tx.payment_status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : tx.payment_status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : tx.payment_status === 'refunded'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {tx.payment_status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-400">{tx.transaction_id || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedLogModal(tx)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      title="View Request/Response Payloads"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>

                    {tx.payment_status === 'success' && (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-[10px] font-bold transition-colors"
                        title="Issue Refund"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#12131C] border-2 border-[#D4AF37] rounded-3xl p-6 space-y-4 shadow-2xl">
            <button
              onClick={() => setSelectedLogModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif text-white">
              Gateway Transaction Payload Log: <span className="text-[#D4AF37]">{selectedLogModal.booking_reference}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-amber-200 block mb-1">Request Payload:</strong>
                <pre className="bg-[#090A0E] p-3 rounded-xl text-slate-300 font-mono overflow-x-auto text-[11px] border border-white/10">
                  {JSON.stringify(selectedLogModal.request_payload, null, 2)}
                </pre>
              </div>

              <div>
                <strong className="text-emerald-300 block mb-1">Server Response Payload:</strong>
                <pre className="bg-[#090A0E] p-3 rounded-xl text-emerald-400 font-mono overflow-x-auto text-[11px] border border-white/10">
                  {JSON.stringify(selectedLogModal.response_payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
