import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building, Calendar,
  ShieldCheck, Lock, Save, RefreshCw, CheckCircle2,
  AlertTriangle, Briefcase, Award
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/employee';

const AVATAR_OPTIONS = ['🔧', '👤', '👷', '💼', '⚡', '🛠️', '📋', '👔'];

export default function EmployeeProfilePage({ currentUser, onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields form state
  const [form, setForm] = useState({
    phone: '',
    address: '',
    emergencyContact: '',
    bio: '',
    avatar: '🔧'
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/profile?userId=${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setForm({
          phone: json.data.phone || '+91 98112-40912',
          address: json.data.address || 'Connaught Place, New Delhi',
          emergencyContact: json.data.emergency_contact || '+91 98111-00998',
          bio: json.data.bio || 'Senior Field Technician specializing in HVAC and distribution electrical infrastructure.',
          avatar: json.data.avatar || '🔧'
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone: form.phone,
          address: form.address,
          emergencyContact: form.emergencyContact,
          bio: form.bio,
          avatar: form.avatar
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Personal contact and profile details updated successfully.');
        setProfile(json.data);
        if (onProfileUpdated) onProfileUpdated(json.data);
      } else {
        setErrorMsg(json.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
        <span>Loading employee credentials...</span>
      </div>
    );
  }

  const p = profile || currentUser || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
          <User className="h-6 w-6 text-sky-500" />
          <span>Employee Profile &amp; Identity</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View official enterprise credentials and manage personal contact details
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 text-white flex-shrink-0">
          {form.avatar || p.avatar || '🔧'}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{p.name || 'Rahul Sharma'}</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono">
              ID: {p.user_id || 'usr-102'}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {p.designation || p.role || 'Senior Field Technician'} • {p.department || 'Delhi Central Hub'}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{p.email}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>Reports to: <strong>{p.reporting_manager || 'Rajesh Kumar'}</strong></span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Employment Records (Read-Only / Manager-Controlled) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Employment Records
            </h3>
            <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center space-x-1">
              <Lock className="h-2.5 w-2.5" />
              <span>Manager Controlled</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Designation / Grade</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {p.designation || 'Senior Field Technician (Grade II)'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Operating Department</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {p.department || 'Operations Dispatch'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Reporting Authority</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {p.reporting_manager || 'Rajesh Kumar (Operations Director)'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Joining Date</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                {p.joining_date || 'March 15, 2024'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Official Work Email</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                {p.email}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Employment credentials and assignments can only be modified by authorized human resources or dispatch managers.
            </div>
          </div>
        </div>

        {/* Right Column: Editable Personal Contact Details */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <User className="h-4 w-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Permitted Personal Information
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Choose Avatar Emoji */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setForm({ ...form, avatar: av })}
                    className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer border ${
                      form.avatar === av
                        ? 'bg-sky-500/20 border-sky-500 ring-2 ring-sky-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:scale-105'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Personal Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98112-40912"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Residential Base Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Connaught Place, New Delhi"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                placeholder="+91 98111-00998 (Spouse / Guardian)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bio / Specialization Notes
              </label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief summary of technical expertise..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center space-x-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
