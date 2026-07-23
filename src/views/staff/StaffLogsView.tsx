import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Clock,
  User,
  ShieldCheck,
  X
} from 'lucide-react';

export const StaffLogsView: React.FC = () => {
  const { scanLogs, showToast } = useCinema();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'valid' | 'already_used' | 'invalid'>('ALL');

  const filteredLogs = scanLogs.filter((log) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      log.bookingId.toLowerCase().includes(query) ||
      log.staffName.toLowerCase().includes(query) ||
      log.staffId.toLowerCase().includes(query) ||
      (log.manualReason && log.manualReason.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterResult !== 'ALL') {
      return log.scanResult === filterResult;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (scanLogs.length === 0) {
      showToast('No scan logs available to export', 'warning');
      return;
    }

    const headers = ['Log ID', 'Booking ID', 'Staff ID', 'Staff Name', 'Scan Method', 'Scan Result', 'Reason', 'Scanned At', 'Branch'];
    const rows = scanLogs.map((l) => [
      l.id,
      l.bookingId,
      l.staffId,
      `"${l.staffName}"`,
      l.scanMethod,
      l.scanResult,
      `"${l.manualReason || ''}"`,
      l.scannedAt,
      `"${l.branch}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gajuri_Scan_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported scan audit logs to CSV', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="bg-[#0C0D15] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold font-serif text-amber-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              <span>Gate Scanning Audit Logs & Fraud Prevention</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable scan event records for gate security & entry audit trail
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit Report</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Booking ID, Staff Member, or Manual Reason..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#141522] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#141522] p-1 rounded-xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => setFilterResult('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterResult === 'ALL' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'
              }`}
            >
              All Events ({scanLogs.length})
            </button>
            <button
              onClick={() => setFilterResult('valid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterResult === 'valid' ? 'bg-emerald-500 text-black' : 'text-emerald-400/80'
              }`}
            >
              Valid
            </button>
            <button
              onClick={() => setFilterResult('already_used')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterResult === 'already_used' ? 'bg-rose-500 text-white' : 'text-rose-400/80'
              }`}
            >
              Already Used
            </button>
            <button
              onClick={() => setFilterResult('invalid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterResult === 'invalid' ? 'bg-amber-500 text-black' : 'text-amber-400/80'
              }`}
            >
              Unrecognized
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-[#0C0D15] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#12131D] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Scan Method</th>
                <th className="py-3.5 px-4">Scan Outcome</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.scannedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                      {log.bookingId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{log.staffName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.staffId}</span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {log.scanMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {log.scanResult === 'valid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VALID ADMISSION</span>
                        </span>
                      )}
                      {log.scanResult === 'already_used' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>ALREADY USED</span>
                        </span>
                      )}
                      {log.scanResult === 'invalid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>UNRECOGNIZED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs italic">
                      {log.manualReason || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                    No scan logs recorded yet matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
