import React, { useState } from 'react';
import { X, CheckCircle2, Shield, CreditCard, QrCode, ArrowRight, Copy, Check, Sparkles, AlertCircle, Building, Mail, User } from 'lucide-react';
import { PLANS } from './SubscriptionSelectionModal.jsx';

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  selectedPlanId = 'professional',
  onPaymentSuccess,
  darkMode = false
}) {
  if (!isOpen) return null;

  const plan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1]; // default to professional

  const [paymentTab, setPaymentTab] = useState('online'); // 'online' | 'upi'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [issuedLicenseKey, setIssuedLicenseKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  // Price calculations
  const priceINR = plan.id === 'enterprise' ? 4999 : 1999;
  const gst = Math.round(priceINR * 0.18);
  const totalAmount = priceINR + gst;

  // 1. Process Online Payment Gateway
  const handleOnlinePayment = async (e) => {
    e.preventDefault();
    if (!customerEmail || !organizationName) {
      setError('Please provide your organization name and business email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscriptions/payments/verify-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Authorized Manager',
          customerEmail,
          organizationName,
          plan: plan.id,
          amount: totalAmount,
          paymentMethod: 'card_online'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment gateway verification failed.');
      }

      setIssuedLicenseKey(data.licenseKey);
      setPaymentCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Manual UPI Payment
  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!customerEmail || !organizationName || !utrNumber) {
      setError('Please enter your organization name, email, and 12-digit UPI UTR / Ref number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscriptions/payments/submit-manual-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Authorized Manager',
          customerEmail,
          organizationName,
          plan: plan.id,
          amount: totalAmount,
          utrNumber
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit UPI payment.');
      }

      setUpiSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (issuedLicenseKey) {
      navigator.clipboard.writeText(issuedLicenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        darkMode ? 'bg-[#091120] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Top Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black leading-tight">
                {paymentCompleted ? 'Payment Confirmed & License Issued' : `Subscribe to ${plan.name}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official E-WorkForce Subscription &amp; Organization Licensing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {/* SUCCESS SCREEN: Online Payment Verified -> Issued License Key */}
          {paymentCompleted ? (
            <div className="text-center py-4 space-y-6">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Transaction Successful</span>
                <h4 className="text-2xl font-black mt-1">Your Organization License is Ready!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2">
                  Payment for <strong>{plan.name}</strong> has been verified. Use this unique license key to register your organization and manager account.
                </p>
              </div>

              {/* License Key Display Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/40 max-w-md mx-auto shadow-xl shadow-sky-500/10 text-center relative">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Organization License Key</span>
                <div className="mt-2 text-2xl sm:text-3xl font-black font-mono tracking-widest text-white select-all">
                  {issuedLicenseKey}
                </div>

                <div className="mt-3 flex items-center justify-center space-x-2">
                  <button
                    onClick={handleCopyKey}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold cursor-pointer border border-sky-500/30 transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              {/* Proceed to Registration Action */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    onClose();
                    onPaymentSuccess && onPaymentSuccess({
                      plan: plan.id,
                      licenseKey: issuedLicenseKey,
                      orgName: organizationName,
                      email: customerEmail,
                      name: customerName
                    });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-sky-500/30 inline-flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <span>Proceed to Organization Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-[11px] text-slate-500">
                  Your license key will be pre-filled automatically on the next screen.
                </p>
              </div>
            </div>
          ) : upiSubmitted ? (
            /* UPI MANUAL PAYMENT PENDING SCREEN */
            <div className="text-center py-6 space-y-5">
              <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center animate-pulse">
                <Sparkles className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Manual Payment Verification in Progress</span>
                <h4 className="text-xl font-black mt-1">UTR Reference Recorded</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you! Your UPI reference (<strong>{utrNumber}</strong>) has been submitted to the E-WorkForce billing desk. Once verified by our Super Admin team, your license key will be activated.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs max-w-md mx-auto">
                <p className="font-semibold">Demo Notice:</p>
                <p className="text-[11px] mt-1 opacity-90">
                  You can immediately approve this payment in the Super Admin Console to receive your key right away for testing!
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Close &amp; Check Email
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <div className="space-y-6">
              
              {/* Plan Summary Pill */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Selected Plan</span>
                  <div className="text-base font-black">{plan.name}</div>
                  <div className="text-xs text-slate-500">{plan.employeeLimit} • 365 Days Organization License</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono">₹{priceINR.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-500">+ 18% GST (₹{gst}) = ₹{totalAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Organization & Buyer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Organization Name *
                  </label>
                  <div className="relative">
                    <Building className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Fleet Services"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Business / Billing Email *
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="billing@yourcompany.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Switcher: Online vs UPI Manual */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Select Payment Method *
                </label>
                <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
                  darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => { setPaymentTab('online'); setError(''); }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      paymentTab === 'online'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Instant Online Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentTab('upi'); setError(''); }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      paymentTab === 'upi'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>UPI / QR / Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Online Gateway Checkout */}
              {paymentTab === 'online' && (
                <form onSubmit={handleOnlinePayment} className="space-y-4 pt-1">
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-blue-50/50 border-blue-200 text-slate-600'
                  }`}>
                    <div className="flex items-center space-x-2 text-sky-500 font-bold mb-1">
                      <Shield className="h-4 w-4" />
                      <span>Instant Automated License Issuance</span>
                    </div>
                    <p>
                      Supports Visa, MasterCard, RuPay, UPI AutoPay, and NetBanking. Once payment is authorized, your organization license key is generated on-screen immediately.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Processing Transaction...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Issue License`}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* TAB 2: UPI / QR Code Manual Payment */}
              {paymentTab === 'upi' && (
                <form onSubmit={handleUpiSubmit} className="space-y-4 pt-1">
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 ${
                    darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Simulated QR Code Canvas */}
                    <div className="h-28 w-28 bg-white rounded-xl p-2 border border-slate-300 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                      <div className="text-[10px] font-black font-mono text-slate-900 mb-0.5">UPI QR PAY</div>
                      <div className="h-16 w-16 bg-slate-900 rounded p-1 flex items-center justify-center text-white text-[9px] font-mono text-center">
                        [QR CODE]
                        <br />₹{totalAmount}
                      </div>
                      <div className="text-[8px] font-bold text-slate-500 mt-0.5">eworkforce@upi</div>
                    </div>

                    <div className="text-xs space-y-1.5 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white">Pay via Any UPI App (GPay, PhonePe, Paytm, BHIM)</div>
                      <div className="font-mono text-sky-500 font-bold">UPI ID: eworkforce@upi</div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                        1. Scan QR code or pay to <strong>eworkforce@upi</strong>.<br />
                        2. Amount to transfer: <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>.<br />
                        3. Enter the 12-digit UPI UTR / Reference number below for verification.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      12-Digit UPI Reference / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 403928172645"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border font-mono tracking-wider focus:outline-none transition-colors ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting Reference...' : 'Submit Payment Proof for Verification'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
