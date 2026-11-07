import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Briefcase,
  QrCode, Camera, Edit3, Calendar, Heart, Award,
  CheckCircle2, AlertCircle, Save, X, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const ProfileScreen: React.FC = () => {
  const { currentUser, updateUser, showToast, logout } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form edit states
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(currentUser?.address || 'Flat 402, Green Avenue, Sector 62, Noida');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergency_contact || '+91 99887 76655 (Brother)');

  const handleCaptureAvatar = async () => {
    try {
      if (Capacitor.isPluginAvailable('Camera')) {
        const image = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt
        });
        if (image.dataUrl) {
          updateUser({ avatar: image.dataUrl });
          showToast('Profile photo updated!', 'success');
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                updateUser({ avatar: reader.result as string });
                showToast('Profile photo updated!', 'success');
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } catch {
      // User cancelled
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.updateProfile({
        phone,
        address,
        emergency_contact: emergencyContact
      });
      updateUser({
        phone,
        address,
        emergency_contact: emergencyContact
      });
      showToast('Profile details updated successfully', 'success');
      setShowEditModal(false);
    } catch {
      updateUser({
        phone,
        address,
        emergency_contact: emergencyContact
      });
      showToast('Profile saved offline', 'info');
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const employeeCode = currentUser?.employee_id || 'EWF-8842';

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Digital Official ID Card (Holographic Card) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 text-white p-5 shadow-2xl overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-black tracking-widest uppercase text-blue-300">
              E-WorkForce Digital ID
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            VERIFIED ACTIVE
          </span>
        </div>

        {/* Profile Details & Photo */}
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl flex-shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-bold text-white">
                  {currentUser?.name?.charAt(0) || 'E'}
                </div>
              )}
            </div>
            <button
              onClick={handleCaptureAvatar}
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white shadow-md active:scale-95"
              title="Change Photo"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-white">
              {currentUser?.name || 'Field Technician'}
            </h3>
            <p className="text-xs text-blue-300 font-medium">
              {currentUser?.designation || currentUser?.role || 'Senior HVAC Specialist'}
            </p>
            <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-300 font-mono">
              <span>ID: {employeeCode}</span>
              <span>•</span>
              <span>Dept: {currentUser?.department || 'Field Operations'}</span>
            </div>
          </div>
        </div>

        {/* QR Code & Scan verification block */}
        <div className="mt-4 pt-4 border-t border-blue-500/20 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-white text-slate-900 shadow-md">
              <QrCode className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 block">Security Gate QR</span>
              <span className="text-[9px] text-blue-300 font-mono">Scan for site check-in</span>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold backdrop-blur-md transition-all"
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-300" />
            <span>Edit Info</span>
          </button>
        </div>
      </div>

      {/* Personal & Employment Details */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Employment & Contact Records
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Email Address</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser?.email || 'technician@eworkforce.io'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Mobile Phone</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{phone}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Assigned Base / Address</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{address}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Date of Joining</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser?.joining_date || 'January 15, 2024'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Kit & Assets */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Field Kit & Assigned Equipment
        </h4>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080e1c] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Field Van</span>
            <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">DL-01-AX-4821</p>
            <span className="text-[9px] text-emerald-500">Fastag & GPS Active</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080e1c] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Diagnostic Toolkit</span>
            <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">TK-PRO-902</p>
            <span className="text-[9px] text-blue-500">Calibrated Oct 2026</span>
          </div>
        </div>
      </div>

      {/* Emergency Contact Quick Dial */}
      <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-500">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Emergency Contact
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{emergencyContact}</p>
          </div>
        </div>

        <a
          href={`tel:${emergencyContact.split(' ')[0]}`}
          className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/25 active:scale-95 flex items-center space-x-1"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Call</span>
        </a>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1629] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Update Contact Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Emergency Contact & Relationship
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
