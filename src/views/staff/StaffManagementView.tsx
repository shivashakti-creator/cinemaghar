import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { StaffAccount, StaffRoleType } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Check,
  X,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  Building,
  Film,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const StaffManagementView: React.FC = () => {
  const {
    staffAccounts,
    createStaffAccount,
    updateStaffAccount,
    toggleStaffActive,
    deleteStaffAccount,
    showToast
  } = useCinema();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [staffId, setStaffId] = useState('');
  const [role, setRole] = useState<StaffRoleType>('Gate Scanner');
  const [branch, setBranch] = useState('Gajuri Main Branch');
  const [assignedHall, setAssignedHall] = useState('Hall 1 - IMAX 3D');
  const [password, setPassword] = useState('staff123');

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setStaffId('');
    setRole('Gate Scanner');
    setBranch('Gajuri Main Branch');
    setAssignedHall('Hall 1 - IMAX 3D');
    setPassword('staff123');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      showToast('Please fill required fields', 'error');
      return;
    }

    await createStaffAccount({
      fullName,
      email,
      phone: phone || '+977 9800000000',
      staffId: staffId || `STF-${String(staffAccounts.length + 1).padStart(3, '0')}`,
      role,
      branch,
      assignedHall,
      isActive: true,
      password
    });

    resetForm();
    setShowAddModal(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    await updateStaffAccount(editingStaff.id, {
      fullName,
      email,
      phone,
      role,
      branch,
      assignedHall
    });

    setEditingStaff(null);
    resetForm();
  };

  const openEditModal = (s: StaffAccount) => {
    setEditingStaff(s);
    setFullName(s.fullName);
    setEmail(s.email);
    setPhone(s.phone);
    setStaffId(s.staffId);
    setRole(s.role);
    setBranch(s.branch);
    setAssignedHall(s.assignedHall || 'Hall 1 - IMAX 3D');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="bg-[#0C0D15] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-serif text-amber-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <span>Staff Account Roster & Access Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage gate scanners, counter officers, and shift credentials
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {/* STAFF ACCOUNTS GRID / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffAccounts.map((s) => (
          <div
            key={s.id}
            className={`bg-[#0E0F18] border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden ${
              s.isActive ? 'border-white/10 hover:border-[#D4AF37]/50' : 'border-rose-500/20 opacity-65'
            }`}
          >
            {/* Top Row: Name & Active Pill */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                    {s.staffId}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {s.role}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mt-1">{s.fullName}</h3>
              </div>

              {/* Active Toggle */}
              <button
                onClick={() => toggleStaffActive(s.id)}
                className={`p-1 rounded-lg transition-colors ${
                  s.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'
                }`}
                title={s.isActive ? 'Deactivate Staff Account' : 'Activate Staff Account'}
              >
                {s.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-xs text-slate-300 border-t border-b border-white/5 py-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono">{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{s.branch} • {s.assignedHall || 'All Halls'}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                {s.lastLoginAt ? `Last login: ${new Date(s.lastLoginAt).toLocaleDateString()}` : 'Never logged in'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  title="Edit Staff Member"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteStaffAccount(s.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                  title="Remove Staff Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE / EDIT STAFF MODAL */}
      {(showAddModal || editingStaff) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131D] border border-[#D4AF37]/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingStaff ? 'Edit Staff Profile' : 'Create Staff Member Account'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStaff(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingStaff ? handleUpdate : handleCreate} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@gajuricinemas.com"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 9841000000"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Staff ID Code</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="Auto-generated e.g. STF-004"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-amber-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRoleType)}
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Gate Scanner">Gate Scanner</option>
                    <option value="Counter Staff">Counter Staff</option>
                    <option value="Manager">Shift Manager</option>
                    <option value="Admin">Full Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Branch Location</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned Hall</label>
                  <select
                    value={assignedHall}
                    onChange={(e) => setAssignedHall(e.target.value)}
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Hall 1 - IMAX 3D">Hall 1 - IMAX 3D</option>
                    <option value="Hall 2 - Gajuri Dolby">Hall 2 - Gajuri Dolby</option>
                    <option value="All Halls">All Screen Halls</option>
                  </select>
                </div>
              </div>

              {!editingStaff && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181926] border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              )}

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold"
                >
                  {editingStaff ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
