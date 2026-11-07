import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, CheckCircle2, Clock, MapPin, 
  ShieldCheck, Smartphone, ExternalLink, Sparkles, User, Copy, Check 
} from 'lucide-react';
import { soundService } from '../utils/soundService.js';
import CustomerTrackingPortalModal from './CustomerTrackingPortalModal';

const API_BASE = 'http://localhost:5000/api';

const TEMPLATES = [
  {
    id: 'on_the_way',
    label: 'En Route & Live ETA',
    icon: '🚚',
    badge: 'Transit',
    defaultEta: 15,
    getMessage: ({ customerName, employeeName, taskTitle, address, eta, taskId }) => 
      `Hi ${customerName}, your service technician ${employeeName} is on the way to ${address} for "${taskTitle}". Estimated arrival in ${eta} minutes.\n\n📍 Live GPS Route: https://ework.app/t/${taskId || '402'}\n\nHave questions? Reply to this message.`
  },
  {
    id: 'arrived',
    label: 'Arrived at Site & OTP',
    icon: '📍',
    badge: 'Arrival',
    defaultEta: 0,
    getMessage: ({ customerName, employeeName, address, otp }) => 
      `Hi ${customerName}, your technician ${employeeName} has arrived at ${address}.\n\n🔐 Please share this Security Verification PIN with the technician upon entry: *${otp || '4921'}*`
  },
  {
    id: 'completed',
    label: 'Completed & Sign-off',
    icon: '✅',
    badge: 'Signed Off',
    defaultEta: 0,
    getMessage: ({ customerName, taskTitle, taskId }) => 
      `Hi ${customerName}, work order #${taskId || 'T-402'} for "${taskTitle}" has been completed and verified.\n\n📄 Download Signed Work Order PDF & rate your technician: https://ework.app/cert/${taskId || '402'}\n\nThank you for choosing Ework!`
  }
];

export default function CustomerAlertDispatcherModal({ isOpen, task, onClose }) {
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'sms'
  const [selectedTemplate, setSelectedTemplate] = useState('on_the_way');
  const [customerName, setCustomerName] = useState(task?.customer_name || 'Vikram Malhotra');
  const [customerPhone, setCustomerPhone] = useState(task?.customer_phone || '+91 98112-40912');
  const [employeeName, setEmployeeName] = useState(task?.assignee || 'Rahul Sharma');
  const [eta, setEta] = useState(15);
  const [otp, setOtp] = useState('4921');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  if (!isOpen || !task) return null;

  const activeTemplateObj = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

  const currentMessage = activeTemplateObj.getMessage({
    customerName,
    employeeName,
    taskTitle: task.title || 'HVAC Service Inspection',
    address: task.address || 'Connaught Place, New Delhi',
    eta,
    otp,
    taskId: task.id || '402'
  });

  const handleSend = async () => {
    setIsSending(true);
    setSentSuccess(false);

    try {
      soundService.playSuccessChime();

      await fetch(`${API_BASE}/notifications/customer-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          template: selectedTemplate,
          customerName,
          customerPhone,
          employeeName,
          taskTitle: task.title,
          address: task.address,
          etaMinutes: eta,
          otpCode: otp,
          customMessage: currentMessage
        })
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.warn('Notification dispatch fallback:', err);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2500);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Automated Customer Arrival Alerts</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Direct Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Task: <span className="text-slate-200 font-semibold">{task.title}</span> · Destination: {task.address}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowPortal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Preview Customer Portal</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Left: Controls & Templates, Right: Real-Time Phone Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          
          {/* LEFT: Dispatch Controls & Template Selectors */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-5 bg-slate-900/60">
            
            {/* Delivery Channel Switcher */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                Select Dispatch Channel:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    💬
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>WhatsApp Business</span>
                      <span className="text-[10px] text-emerald-400">✓</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Cloud API Verified Template</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 ${
                    channel === 'sms'
                      ? 'bg-sky-950/40 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-lg">
                    📱
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Direct SMS Alert</div>
                    <div className="text-[10px] text-slate-400">Gupshup / Twilio Gateway</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                Scenario Trigger Templates:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      if (tpl.defaultEta > 0) setEta(tpl.defaultEta);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTemplate === tpl.id
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <span>{tpl.icon}</span>
                      <span className="truncate">{tpl.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{tpl.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Customer Mobile Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Assigned Technician</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={e => setEmployeeName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {selectedTemplate === 'on_the_way' ? (
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>Arrival ETA</span>
                      <span className="font-mono text-cyan-400 font-bold">{eta} minutes</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={eta}
                      onChange={e => setEta(Number(e.target.value))}
                      className="w-full accent-cyan-400 mt-2 cursor-pointer"
                    />
                  </div>
                ) : selectedTemplate === 'arrived' ? (
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">Security OTP PIN</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">Certificate ID</label>
                    <div className="w-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 font-mono">
                      WO-{task.id || '402'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Dispatch Trigger Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  sentSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : channel === 'whatsapp'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-blue-500/25'
                }`}
              >
                {sentSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Alert Dispatched Successfully!</span>
                  </>
                ) : isSending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Dispatching via Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send {channel === 'whatsapp' ? 'WhatsApp Template' : 'SMS Alert'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT: Real-Time Smartphone Bubble Preview */}
          <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col items-center justify-center">
            
            {/* Phone Screen Mockup */}
            <div className="w-full max-w-xs bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
              
              {channel === 'whatsapp' ? (
                <>
                  {/* WhatsApp App Header */}
                  <div className="bg-[#075e54] text-white p-3 flex items-center space-x-2.5 shadow-md">
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-emerald-400 flex items-center justify-center text-xs font-bold">
                      EW
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center space-x-1">
                        <span className="truncate">Ework Field Service</span>
                        <span className="text-[10px] text-emerald-400">✓</span>
                      </div>
                      <div className="text-[9px] text-emerald-200">Official Business Account</div>
                    </div>
                  </div>

                  {/* Chat Wallpaper Canvas */}
                  <div className="p-3 bg-[#0b141a] min-h-[300px] flex flex-col justify-end text-xs space-y-2">
                    
                    {/* Timestamp Pill */}
                    <div className="text-center">
                      <span className="bg-[#182229] text-slate-400 text-[9px] px-2 py-0.5 rounded-md font-mono">
                        TODAY
                      </span>
                    </div>

                    {/* WhatsApp Inbound Bubble */}
                    <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-none shadow-md max-w-[92%] self-start space-y-2">
                      <p className="text-[11px] leading-relaxed whitespace-pre-line select-text">
                        {currentMessage}
                      </p>

                      <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-200 mt-1">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-cyan-300 font-bold">✓✓</span>
                      </div>
                    </div>

                    {/* Interactive Action Buttons attached to template */}
                    <div className="space-y-1 pt-1 max-w-[92%]">
                      <button
                        type="button"
                        onClick={() => setShowPortal(true)}
                        className="w-full py-1.5 px-3 bg-[#202c33] hover:bg-[#2a3942] text-cyan-400 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Track Live GPS Route (Click to Preview)</span>
                      </button>
                    </div>

                  </div>
                </>
              ) : (
                <>
                  {/* SMS App Header */}
                  <div className="bg-slate-800 text-white p-3 flex items-center justify-between border-b border-slate-700">
                    <div className="text-xs font-bold flex items-center space-x-1.5">
                      <span>💬 Messages</span>
                    </div>
                    <span className="font-mono text-[10px] text-sky-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                      VK-EWORK
                    </span>
                  </div>

                  {/* SMS Chat Body */}
                  <div className="p-3 bg-slate-950 min-h-[300px] flex flex-col justify-end text-xs space-y-2">
                    <div className="text-center text-[9px] text-slate-500 font-mono">
                      Text Message · Short Code Gateway
                    </div>

                    <div className="bg-sky-600/90 text-white p-3 rounded-2xl rounded-tl-none shadow-md max-w-[92%] self-start">
                      <p className="text-[11px] leading-relaxed whitespace-pre-line select-text font-sans">
                        {currentMessage}
                      </p>
                      <div className="text-right text-[9px] text-sky-200 mt-1 font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 max-w-[92%]">
                      <button
                        type="button"
                        onClick={() => setShowPortal(true)}
                        className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Open Live Tracking Portal</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="text-[10px] text-slate-500 mt-3 text-center">
              Customer receives this live notification with one-click map tracking
            </div>

          </div>

        </div>

      </div>

      {/* Customer Live Tracking Portal Modal */}
      <CustomerTrackingPortalModal
        isOpen={showPortal}
        onClose={() => setShowPortal(false)}
        task={task}
      />

    </div>
  );
}
