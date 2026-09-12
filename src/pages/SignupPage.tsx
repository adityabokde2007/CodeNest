import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref as dbRef, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import { Code2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';

const SignupPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      console.log('[Signup Success] Account created:', userCredential.user.email);
      
      // Create initial profile in Firebase Realtime Database
      const profileData = {
        name: name.trim(),
        photoBase64: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await set(dbRef(database, `profiles/${userCredential.user.uid}`), profileData);
      console.log('[Signup] Profile created in database');

      await signOut(auth);
      showToast('Account created successfully! Redirecting to login...', 'success');
      navigate('/login', { replace: true });
    } catch (err: any) {
      console.error('[Signup Error]', err.code, err.message);
      
      // Show user-friendly error messages based on Firebase error codes
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format. Please check and try again.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use at least 6 characters with a mix of letters and numbers.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
          showToast('Failed to create account. Please try again.', 'error');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">Create an Account</h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">Join CodeNest to store your snippets</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100/80 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-surface-light text-text-main placeholder-text-muted/60"
              placeholder="Enter your name"
              required
            />
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
                placeholder="Create a password"
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

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-surface-light text-text-main placeholder-text-muted/60"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors mt-4 shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
