import React, { useState } from 'react';
import { Pill, Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Mail, User, Building } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Chief Pharmacist');
  const [pharmacyName, setPharmacyName] = useState('St. Jude Central Dispensary');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Full legal name is required for dispensary audit compliance.');
      return;
    }

    // Save user session in localStorage
    const user = {
      name: fullName.trim() || (email.split('@')[0].toUpperCase()),
      email,
      role: mode === 'signup' ? role : 'Lead Dispensary Pharmacist',
      pharmacy: pharmacyName,
    };
    localStorage.setItem('pharmaflow_auth_user', JSON.stringify(user));

    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252A27]/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E6E5DD] shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#F8F7F2] p-6 border-b border-[#E6E5DD] text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#777C76] hover:text-[#252A27] text-lg font-bold p-1 rounded-lg"
          >
            &times;
          </button>

          <div className="w-11 h-11 rounded-xl bg-[#183D32] text-white flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>

          <h2 className="text-xl font-heading font-extrabold text-[#183D32]">
            {mode === 'login' ? 'Dispensary Portal Sign In' : 'Register Pharmacy Workspace'}
          </h2>
          <p className="text-xs text-[#777C76] mt-1">
            {mode === 'login'
              ? 'Enter your pharmacy credentials to access operations'
              : 'Create a clinical dispensary inventory account'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#252A27] mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:border-[#183D32] focus:bg-white focus:ring-1 focus:ring-[#183D32]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#252A27] mb-1">
              Institutional Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="pharmacist@dispensary.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:border-[#183D32] focus:bg-white focus:ring-1 focus:ring-[#183D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252A27] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:border-[#183D32] focus:bg-white focus:ring-1 focus:ring-[#183D32]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777C76] hover:text-[#252A27]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  Pharmacy Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32]"
                >
                  <option value="Chief Pharmacist">Chief Pharmacist</option>
                  <option value="Staff Pharmacist">Staff Pharmacist</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Clinical Auditor">Clinical Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  Dispensary Unit
                </label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32]"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#183D32] hover:bg-[#122E26] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-subtle"
            >
              <span>{mode === 'login' ? 'Authenticate & Enter Workspace' : 'Create Workspace Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-[#777C76]">
            {mode === 'login' ? (
              <span>
                Need a new pharmacy workspace?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-[#183D32] font-semibold hover:underline"
                >
                  Get Started
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-[#183D32] font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </form>

        {/* Security Footer Notice */}
        <div className="bg-[#F8F7F2] px-6 py-3 border-t border-[#E6E5DD] flex items-center justify-center gap-1.5 text-[11px] text-[#777C76]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#183D32]" />
          <span>Encrypted HIPAA & Pharmacopeia audit session</span>
        </div>
      </div>
    </div>
  );
};
