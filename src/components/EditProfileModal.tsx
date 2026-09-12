import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, photoBase64: string | null) => Promise<void>;
  currentName: string;
  currentEmail: string;
  currentPhoto: string | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentEmail,
  currentPhoto
}) => {
  const [name, setName] = useState(currentName);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentPhoto);
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setPhotoPreview(currentPhoto);
      setNewPhotoBase64(null);
      setError('');
    }
  }, [isOpen, currentName, currentPhoto]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const confirmLarge = confirm(
        'This image is quite large (over 5MB). It will be compressed. Continue?'
      );
      if (!confirmLarge) {
        e.target.value = '';
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('[Profile] Compressing profile photo...');
      // Compress to max 300x300 for avatar (smaller than pictures)
      const base64 = await compressImage(file, 300, 0.8);
      setNewPhotoBase64(base64);
      setPhotoPreview(base64);
      console.log('[Profile] Photo compressed successfully');
    } catch (err) {
      console.error('[Profile] Error compressing photo:', err);
      setError('Failed to process image. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(name.trim(), newPhotoBase64);
      onClose();
    } catch (err: any) {
      console.error('[Profile] Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Get initial for fallback avatar
  const initial = name.charAt(0).toUpperCase() || currentEmail.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface backdrop-blur-xl rounded-2xl shadow-2xl border border-border w-full max-w-md p-5 sm:p-6 relative max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors p-1 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-text-main mb-5 sm:mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100/80 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="mb-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-2 border-border">
                  {initial}
                </div>
              )}
            </div>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isProcessing || isSaving}
                className="hidden"
              />
              <div className="min-h-[44px] flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text-main hover:bg-surface-light transition-colors font-medium text-sm disabled:opacity-50">
                <Upload size={16} />
                <span>{isProcessing ? 'Processing...' : 'Change Photo'}</span>
              </div>
            </label>
            <p className="text-xs text-text-muted mt-2">Max 300x300px, compressed automatically</p>
          </div>

          {/* Name Input */}
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
              disabled={isSaving}
            />
          </div>

          {/* Email Display (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Email Address
            </label>
            <div className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface-light/50 text-text-muted text-sm">
              {currentEmail}
            </div>
            <p className="text-xs text-text-muted mt-1">Email cannot be changed here</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-main hover:bg-surface-light transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isProcessing}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
