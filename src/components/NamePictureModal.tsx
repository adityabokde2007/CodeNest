import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NamePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isProcessing?: boolean;
}

const NamePictureModal: React.FC<NamePictureModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  isProcessing = false
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface backdrop-blur-xl border border-border w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg sm:text-xl font-bold text-text-main">Name Your Picture</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-light rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Picture Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vacation Photo, Project Screenshot"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface-light text-text-main placeholder-text-muted/60"
              required
              autoFocus
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="min-h-[44px] px-4 py-2 text-text-muted hover:bg-surface-light border border-border rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isProcessing}
              className="min-h-[44px] px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {isProcessing ? 'Saving...' : 'Save Picture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NamePictureModal;
