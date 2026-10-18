import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

let ForgotPassword = () => {
  let navigate = useNavigate();
  let [step, setStep] = useState('email'); 
  let [email, setEmail] = useState('');
  let [newPassword, setNewPassword] = useState('');
  let [confirmPassword, setConfirmPassword] = useState('');
  let [resetToken, setResetToken] = useState(null);
  let [loading, setLoading] = useState(false);

  let handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('reset');
        toast.success('Verification successful! Enter new password.');
      } else {
        toast.error('Failed to get reset token');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  let handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/reset-password', { 
        token: resetToken, 
        newPassword 
      });
      
      toast.success('Password changed successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
            {step === 'email' ? 'Forgot Password?' : 'Set New Password'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2">
            {step === 'email' 
              ? 'Enter your registered email address.' 
              : 'Verify identity and choose a new password.'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
            
             <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-stone-500 dark:text-zinc-400 hover:text-indigo-600 underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full mt-2 py-2 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors"
            >
              ← Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;