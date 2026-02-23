'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

const COMPANY_ID = 'twiga-agm';

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const userEmail = user?.email || '';
  const userMetaFullName =
    typeof user?.user_metadata?.full_name === 'string' ? (user.user_metadata.full_name as string) : '';
  const fallbackFromEmail = (email: string) =>
    email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!supabase || !user?.id) {
        if (active) setLoading(false);
        return;
      }

      const { data, error: loadError } = await supabase
        .from('admin_profiles')
        .select('full_name, phone, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!active) return;

      if (loadError) {
        setError(loadError.message);
      } else if (data) {
        setFullName((data.full_name as string) || '');
        setPhone((data.phone as string) || '');
      } else {
        const defaultName = userMetaFullName || (userEmail ? fallbackFromEmail(userEmail) : '');
        setFullName(defaultName);
      }

      setLoading(false);
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user?.id, userEmail, userMetaFullName]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (!supabase || !user?.id) {
      setError('You must be logged in.');
      setSaving(false);
      return;
    }

    try {
      const now = Date.now();
      const updatePayload = {
        email: user.email || null,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        updated_at: now,
      };

      const { data: updatedRows, error: updateError } = await supabase
        .from('admin_profiles')
        .update(updatePayload)
        .eq('user_id', user.id)
        .select('user_id')
        .limit(1);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase.from('admin_profiles').insert({
          user_id: user.id,
          company_id: COMPANY_ID,
          email: user.email || null,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          role: 'manager',
          updated_at: now,
        });

        if (insertError) {
          setError(insertError.message);
          setSaving(false);
          return;
        }
      }

      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
        },
      });

      setMessage('Profile saved.');
      setSaving(false);
    } catch {
      setError('Network error. Please retry.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-7 h-7 text-[#7d8f7a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1f2d23]">Settings</h1>
        <p className="text-sm text-[#6f7f70] mt-1">Manage your admin profile information.</p>
      </div>

      <form onSubmit={onSave} className="bg-white border border-[#dce5db] rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-2 border-b border-[#e7ede6]">
          <div className="w-10 h-10 rounded-full bg-[#e7efe5] flex items-center justify-center">
            <User className="w-5 h-5 text-[#5d785f]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#25362b]">{user?.email}</p>
            <p className="text-xs text-[#7b8b7b]">Authenticated Supabase account</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#7b8b7b] mb-2">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full h-11 rounded-xl border border-[#d8e1d7] px-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#7b8b7b] mb-2">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+255 ..."
            className="w-full h-11 rounded-xl border border-[#d8e1d7] px-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
          />
        </div>

        {error && <p className="text-sm text-[#be4c42]">{error}</p>}
        {message && <p className="text-sm text-[#4d7451]">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-[#4f7252] hover:bg-[#436447] text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </form>
    </div>
  );
}
