import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Footprints, Mail, Lock, User, Sparkles, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../hooks/useSneakers';

interface SignInProps {
  onSuccess?: () => void;
}

export default function SignIn({ onSuccess }: SignInProps) {
  const { signIn, signUp, signInWithGoogle, signInAsGuest, error: authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGuestSignIn = async () => {
    setValidationError(null);
    setLoading(true);
    try {
      const res = await signInAsGuest();
      if (res.success) {
        sessionStorage.setItem('just_signed_in', 'true');
        onSuccess?.();
      } else {
        setValidationError('Failed to sign in as guest.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setValidationError(e.message || 'Failed to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setLoading(true);

    if (!email || !password || (isSignUp && !username)) {
      setValidationError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const res = await signUp(email, password, username);
        if (res.success) {
          sessionStorage.setItem('just_signed_in', 'true');
          onSuccess?.();
        } else {
          setValidationError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await signIn(email, password);
        if (res.success) {
          sessionStorage.setItem('just_signed_in', 'true');
          onSuccess?.();
        } else {
          setValidationError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      setValidationError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setValidationError(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.success) {
        sessionStorage.setItem('just_signed_in', 'true');
        onSuccess?.();
      } else if (res?.error) {
        setValidationError(res.error);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setValidationError(e.message || 'Failed to initiate Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background glowing accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/10">
            <Footprints className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-6 text-center text-3xl font-extrabold text-zinc-100 tracking-tight"
        >
          {isSignUp ? 'Create your locker' : 'Sign in to your locker'}
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-2 text-center text-xs text-zinc-500 tracking-wider uppercase"
        >
          {isSupabaseConfigured ? 'Sneaker Roulette Live Auth' : 'Sneaker Roulette Local Sandbox'}
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="bg-zinc-900/60 backdrop-blur-xl py-8 px-6 sm:px-10 border border-zinc-800/50 rounded-3xl shadow-2xl"
        >
          {/* Environment Banner */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-normal text-amber-300/90">
                <strong>Local Sandbox Active</strong>: Any credentials will succeed. Perfect for instant local and offline exploration! Configure Supabase env keys to sync live database accounts.
              </p>
            </div>
          )}

          {/* Errors display */}
          <AnimatePresence mode="wait">
            {(validationError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs font-medium leading-relaxed">
                  {validationError || authError}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/30 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl pl-11 pr-11 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-100 text-sm font-semibold rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-red-500/10 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-800/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/60 px-2.5 text-zinc-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-medium rounded-2xl cursor-pointer transition-colors active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.543 0 2.943.543 4.05 1.44l3.18-3.18C19.143 1.833 15.932.75 12.24.75 6.015.75 1 5.765 1 12s5.015 11.25 11.24 11.25c5.895 0 10.864-4.223 10.864-11.25 0-.765-.075-1.5-.21-2.215H12.24z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Continue as Guest (Bypass Auth)</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setValidationError(null);
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold uppercase tracking-wider"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
