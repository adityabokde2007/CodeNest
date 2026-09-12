import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { get, ref as dbRef } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import { Code2, Eye, EyeOff, X } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

const LoginPage = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      let displayName = userCredential.user.displayName || '';

      try {
        const profileSnapshot = await get(dbRef(database, `profiles/${userCredential.user.uid}`));
        displayName = profileSnapshot.val()?.name?.trim() || displayName;
      } catch (profileError) {
        console.warn('[Login] Could not load profile name:', profileError);
      }

      showToast(displayName ? `Welcome back, ${displayName}!` : 'Welcome back!', 'success');
      // Success - Firebase will automatically redirect via auth state observer
    } catch (err: any) {
      console.error('[Login Error]', err.code, err.message);
      
      // Show user-friendly error messages based on Firebase error codes
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Incorrect email or password. Please try again or create an account.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format. Please check and try again.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please wait a moment and try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError('Login failed. Please try again or create an account if you don\'t have one.');
      }
          showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Pre-fill with email from login form if available
    setResetEmail(email.trim().toLowerCase());
    setResetMessage('');
    setResetError('');
    setShowForgotPasswordModal(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetError('');
    setResetMessage('');

    // Normalize email
    const normalizedEmail = resetEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setResetError('Please enter your email address.');
      setIsResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      console.log('[Password Reset] Email sent to:', normalizedEmail);
      setResetMessage('Password reset email sent! Please check your inbox (and spam folder).');
      setResetError('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setResetMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('[Password Reset Error]', err.code, err.message);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setResetError('Invalid email address format. Please check and try again.');
          break;
        case 'auth/user-not-found':
          setResetError('No account found with this email. Please check the email or sign up first.');
          break;
        case 'auth/too-many-requests':
          setResetError('Too many requests. Please wait a moment and try again.');
          break;
        case 'auth/network-request-failed':
          setResetError('Network error. Please check your internet connection.');
          break;
        default:
          setResetError('Failed to send reset email. Please try again.');
      }
      setResetMessage('');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center py-6 sm:py-12 px-3 sm:px-4 relative overflow-y-auto"
      style={{
        backgroundImage: 'url("/ocean.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Light tinted overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] fixed"></div>

      <div className="w-[90%] max-w-md bg-surface backdrop-blur-xl p-5 sm:p-8 rounded-2xl shadow-xl border border-border relative z-10 my-auto">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 border border-border">
            <Code2 size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">Welcome to CodeNest</h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">Your private code & picture snippet vault</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100/80 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="p-3 bg-blue-50/80 text-blue-700 text-xs rounded-lg border border-blue-200">
            <strong>First time?</strong> You need to create an account using the signup link below before you can login.
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-surface-light text-text-main placeholder-text-muted/60"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-surface-light text-text-main placeholder-text-muted/60"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors mt-2 shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-text-muted hover:text-primary transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/signup" className="text-sm text-text-muted hover:text-text-main transition-colors">
            New here? <span className="text-primary font-medium hover:text-primary-hover">Create an account</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface backdrop-blur-xl rounded-2xl shadow-2xl border border-border w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-text-main mb-2">Reset Password</h2>
            <p className="text-sm text-text-muted mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetError && (
                <div className="p-3 bg-red-100/80 text-red-700 text-sm rounded-lg border border-red-200">
                  {resetError}
                </div>
              )}

              {resetMessage && (
                <div className="p-3 bg-green-100/80 text-green-700 text-sm rounded-lg border border-green-200">
                  {resetMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-surface-light text-text-main placeholder-text-muted/60"
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 border border-border rounded-lg text-text-main hover:bg-surface-light transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="flex-1 min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  {isResetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
