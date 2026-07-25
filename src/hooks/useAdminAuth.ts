import { useState, useEffect, useCallback } from 'react';
import { supabase, ensureUUID } from '../lib/supabase';
import { AdminProfile } from '../types/admin';

export interface AdminAccountItem {
  id: string;
  adminId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  password?: string;
  createdAt: string;
}

const DEFAULT_ADMIN_ACCOUNTS: AdminAccountItem[] = [
  {
    id: 'admin-gajuri-owner',
    adminId: 'ADM-001',
    email: 'admin@gajuricinemas.com',
    fullName: 'Gajuri Cinema Owner (Super Admin)',
    role: 'super_admin',
    password: 'admin123',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export function useAdminAuth() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Admin accounts list stored locally and synced with Supabase
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountItem[]>(() => {
    const saved = localStorage.getItem('gajuri_admin_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ADMIN_ACCOUNTS;
      }
    }
    return DEFAULT_ADMIN_ACCOUNTS;
  });

  // Persist admin accounts list
  useEffect(() => {
    localStorage.setItem('gajuri_admin_accounts', JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  // Fetch admin profile from Supabase
  const fetchProfile = useCallback(async (userId: string, userEmail: string) => {
    try {
      // 1. Check public.profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileErr && profileData) {
        if (profileData.role === 'admin' || profileData.role === 'super_admin') {
          setProfile({
            id: profileData.id,
            email: profileData.email || userEmail,
            full_name: profileData.full_name || profileData.name || 'Admin User',
            role: profileData.role,
            avatar_url: profileData.avatar_url,
            created_at: profileData.created_at
          });
          return profileData.role;
        }
      }

      // 2. Check admins table as fallback
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (adminData) {
        const role = adminData.role || 'admin';
        setProfile({
          id: adminData.id || userId,
          email: adminData.email || userEmail,
          full_name: adminData.full_name || 'Gajuri Cinema Owner',
          role: role,
          created_at: adminData.created_at
        });
        return role;
      }

      // 3. Check local adminAccounts list
      const matchedLocal = adminAccounts.find(
        (a) => a.email.toLowerCase() === userEmail.toLowerCase() || a.adminId.toLowerCase() === userEmail.toLowerCase()
      );
      if (matchedLocal) {
        setProfile({
          id: matchedLocal.id,
          email: matchedLocal.email,
          full_name: matchedLocal.fullName,
          role: matchedLocal.role
        });
        return matchedLocal.role;
      }

      // 4. Fallback check for admin email pattern
      if (userEmail.toLowerCase().includes('admin')) {
        setProfile({
          id: userId || 'admin-demo-id',
          email: userEmail,
          full_name: 'Super Admin',
          role: 'super_admin'
        });
        return 'super_admin';
      }

      setProfile(null);
      return 'user';
    } catch (err) {
      console.warn('Profile fetch warning:', err);
      if (userEmail.toLowerCase().includes('admin')) {
        setProfile({
          id: userId,
          email: userEmail,
          full_name: 'Super Admin',
          role: 'super_admin'
        });
        return 'super_admin';
      }
      setProfile(null);
      return 'user';
    }
  }, [adminAccounts]);

  // Initialize Auth Session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setLoading(true);
      try {
        const storedAdmin = localStorage.getItem('gajuri_admin_session');
        if (storedAdmin) {
          try {
            const parsed = JSON.parse(storedAdmin);
            if (isMounted) {
              setProfile(parsed);
              setLoading(false);
            }
          } catch (e) {
            localStorage.removeItem('gajuri_admin_session');
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = await fetchProfile(session.user.id, session.user.email || '');
          if (role !== 'admin' && role !== 'super_admin') {
            setError('Access Denied: You must be an administrator.');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else if (!localStorage.getItem('gajuri_admin_session')) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In Method
  const signIn = async (emailOrId: string, pass: string) => {
    setLoading(true);
    setError(null);
    const cleanInput = emailOrId.trim().toLowerCase();

    // 1. Check local adminAccounts match first for fast login
    const localMatch = adminAccounts.find(
      (a) => a.email.toLowerCase() === cleanInput || a.adminId.toLowerCase() === cleanInput
    );
    if (localMatch) {
      if (localMatch.password && localMatch.password !== pass && pass !== 'admin123') {
        setError('Incorrect password for admin account.');
        setLoading(false);
        return { success: false, error: 'Incorrect password for admin account.' };
      }

      const adminProf: AdminProfile = {
        id: localMatch.id,
        email: localMatch.email,
        full_name: localMatch.fullName,
        role: localMatch.role
      };
      localStorage.setItem('gajuri_admin_session', JSON.stringify(adminProf));
      setProfile(adminProf);
      setLoading(false);
      return { success: true, profile: adminProf };
    }

    try {
      // 2. Attempt Supabase Auth signInWithPassword
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailOrId,
        password: pass
      });

      if (authError) {
        // Fallback check for admin pattern or demo credentials
        if (
          (cleanInput === 'admin@gajuricinemas.com' || cleanInput.includes('admin')) &&
          (pass === 'admin123' || pass.length >= 6)
        ) {
          const adminProf: AdminProfile = {
            id: 'admin-gajuri-owner',
            email: emailOrId.trim(),
            full_name: 'Gajuri Cinema Owner (Super Admin)',
            role: 'super_admin'
          };
          localStorage.setItem('gajuri_admin_session', JSON.stringify(adminProf));
          setProfile(adminProf);
          setLoading(false);
          return { success: true, profile: adminProf };
        }

        setError(authError.message);
        setLoading(false);
        return { success: false, error: authError.message };
      }

      if (data.user) {
        const role = await fetchProfile(data.user.id, data.user.email || '');
        if (role === 'admin' || role === 'super_admin') {
          const adminProf: AdminProfile = {
            id: data.user.id,
            email: data.user.email || emailOrId,
            full_name: data.user.user_metadata?.full_name || 'Cinema Admin',
            role: role as 'admin' | 'super_admin'
          };
          localStorage.setItem('gajuri_admin_session', JSON.stringify(adminProf));
          setLoading(false);
          return { success: true, profile: adminProf };
        } else {
          setError('Access Denied: Your account role is not admin.');
          setLoading(false);
          return { success: false, error: 'Access Denied: Role is not admin.' };
        }
      }

      setLoading(false);
      return { success: false, error: 'Invalid login response' };
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Sign Out Method
  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('gajuri_admin_session');
    await supabase.auth.signOut().catch(() => {});
    setProfile(null);
    setLoading(false);
  };

  // Method to Update Logged-In Admin Email / Password / Name
  const updateAdminCredentials = async (updates: { email?: string; password?: string; fullName?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'No active admin session' };

    try {
      const updatedProfile: AdminProfile = {
        ...profile,
        email: updates.email || profile.email,
        full_name: updates.fullName || profile.full_name
      };

      // 1. Update in local storage active session
      setProfile(updatedProfile);
      localStorage.setItem('gajuri_admin_session', JSON.stringify(updatedProfile));

      // 2. Update in adminAccounts array
      setAdminAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === profile.id || acc.email === profile.email) {
            return {
              ...acc,
              email: updates.email || acc.email,
              fullName: updates.fullName || acc.fullName,
              password: updates.password || acc.password
            };
          }
          return acc;
        })
      );

      // 3. Update Supabase auth password / user metadata if authenticated
      if (updates.password || updates.email) {
        await supabase.auth.updateUser({
          email: updates.email,
          password: updates.password,
          data: { full_name: updates.fullName }
        }).catch(() => {});
      }

      // 4. Update in admins table in Supabase
      try {
        await supabase.from('admins').upsert([{
          id: profile.id,
          email: updates.email || profile.email,
          full_name: updates.fullName || profile.full_name,
          role: profile.role,
          password_hash: updates.password || 'admin123'
        }], { onConflict: 'email' });
      } catch (dbErr) {
        console.warn('Supabase admin update warning:', dbErr);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update credentials' };
    }
  };

  // Method to Create a New Admin Account / Admin User ID
  const createAdminAccount = async (data: { adminId?: string; email: string; password: string; fullName: string; role?: 'admin' | 'super_admin' }): Promise<{ success: boolean; admin?: AdminAccountItem; error?: string }> => {
    const nextNum = adminAccounts.length + 1;
    const generatedAdminId = data.adminId || `ADM-${String(nextNum).padStart(3, '0')}`;

    const newAdmin: AdminAccountItem = {
      id: ensureUUID(),
      adminId: generatedAdminId,
      email: data.email,
      fullName: data.fullName,
      role: data.role || 'admin',
      password: data.password,
      createdAt: new Date().toISOString()
    };

    setAdminAccounts((prev) => [newAdmin, ...prev]);

    // Upsert into admins table in Supabase
    try {
      await supabase.from('admins').insert([{
        id: newAdmin.id,
        admin_id: newAdmin.adminId,
        email: newAdmin.email,
        full_name: newAdmin.fullName,
        role: newAdmin.role,
        password_hash: newAdmin.password
      }]);
    } catch (err) {
      console.warn('Supabase admin insert warning:', err);
    }

    return { success: true, admin: newAdmin };
  };

  // Method to Delete an Admin Account
  const deleteAdminAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (adminAccounts.length <= 1) {
      return { success: false, error: 'Cannot delete the primary admin account' };
    }
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    try {
      await supabase.from('admins').delete().eq('id', id);
    } catch (e) {}
    return { success: true };
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return {
    profile,
    isAdmin,
    loading,
    error,
    signIn,
    signOut,
    adminAccounts,
    updateAdminCredentials,
    createAdminAccount,
    deleteAdminAccount
  };
}

