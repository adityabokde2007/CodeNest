import React, { useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  photoBase64: string | null;
  onEditProfile: () => void;
  anchorEl: HTMLElement | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  name,
  email,
  photoBase64,
  onEditProfile,
  anchorEl
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  const initial = name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase();

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-[min(16rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] bg-surface backdrop-blur-xl rounded-xl shadow-xl border border-border overflow-hidden z-50"
    >
      {/* Profile Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          {photoBase64 ? (
            <img
              src={photoBase64}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold border border-border">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-main truncate">{name}</p>
            <p className="text-xs text-text-muted truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-2">
        <button
          onClick={() => {
            onEditProfile();
            onClose();
          }}
          className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 text-text-main hover:bg-surface-light rounded-lg transition-colors text-sm font-medium"
        >
          <Settings size={16} />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
