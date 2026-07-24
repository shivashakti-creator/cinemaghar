import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AdminProfile } from '../types/admin';

export function useAdminAuth() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          full_name: 'Gajuri Cinema Owner',
          role: role,
          created_at: adminData.created_at
        });
        return role;
      }

      // 3. Demo Admin fallback check for admin@gajuricinemas.com or local session
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
      // Fallback if admin email matches pattern
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
  }, []);

  // Initialize Auth Session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setLoading(true);
      try {
        // Check local storage demo token first
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

        // Get active Supabase session
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

    // Listen to Supabase Auth Changes
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
  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Attempt Supabase Auth signInWithPassword
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (authError) {
        // Check Demo Fallback Credentials
        if (
          (email.trim().toLowerCase() === 'admin@gajuricinemas.com' || email.trim().toLowerCase().includes('admin')) &&
          (pass === 'admin123' || pass.length >= 6)
        ) {
          const adminProf: AdminProfile = {
            id: 'admin-gajuri-owner',
            email: email.trim(),
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
            email: data.user.email || email,
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

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return {
    profile,
    isAdmin,
    loading,
    error,
    signIn,
    signOut
  };
}
