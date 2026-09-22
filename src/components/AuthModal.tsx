import React, { useState } from 'react';
import { User, LogOut, CheckCircle2, MapPin, Wallet, X, Loader2 } from 'lucide-react';
import { loginWithGoogle, logoutUser } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  deliveryAddress: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  deliveryAddress
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAnonymous = currentUser?.isAnonymous ?? true;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-In failed or was closed:', err);
      setError(err?.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {currentUser && !isAnonymous ? (currentUser.displayName || currentUser.email) : 'My QuickMart Profile'}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>{isAnonymous ? 'Guest Member (Auto Synced)' : 'Verified Member'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* QuickCash Rewards Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> QuickCash Balance
              </span>
              <div className="text-2xl font-black mt-0.5">₹100</div>
              <p className="text-[11px] text-rose-100">Automatically applicable on checkout</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🎁
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">Firestore Cloud Sync</p>
                <p className="text-[10px] text-zinc-500">Orders, cart & favorites live in Cloud</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              Active
            </span>
          </div>

          {/* Saved Delivery Address */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Current Delivery Location</span>
            </h4>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 font-semibold">
              {deliveryAddress}
            </div>
          </div>

          {/* Sign In / Sign Out Section */}
          <div className="pt-2">
            {isAnonymous ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 text-center leading-relaxed">
                  Sign in with your Google account to sync your orders across all your devices and claim member perks.
                </p>
                <button
                  id="google-signin-button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <button
                disabled={loading}
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-2xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
