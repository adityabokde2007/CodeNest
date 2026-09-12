import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref as dbRef, set, get, remove } from 'firebase/database';
import { Code2, LogOut, Plus, Terminal, Image as ImageIcon, AlertTriangle, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, database } from '../lib/firebase';
import { 
  type CodeSnippet,
  type Picture
} from '../lib/storage';
import CodeEntryCard from '../components/CodeEntryCard';
import AddSnippetModal from '../components/AddSnippetModal';
import ImageGallery from '../components/ImageGallery';
import NamePictureModal from '../components/NamePictureModal';
import ProfileDropdown from '../components/ProfileDropdown';
import EditProfileModal from '../components/EditProfileModal';
import { compressImage } from '../lib/imageUtils';
import { useToast } from '../components/ToastContainer';

interface UserProfile {
  name: string;
  photoBase64: string | null;
  createdAt?: number;
  updatedAt?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'snippets' | 'pictures'>('snippets');
  
  // Snippet state
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Picture state
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchPictures = async () => {
    if (!auth.currentUser) {
      console.warn('[CodeNest] No authenticated user, skipping picture fetch');
      setPictures([]);
      return;
    }
    
    try {
      console.log('[CodeNest] Loading pictures from Firebase Realtime Database');
      const picturesRef = dbRef(database, `users/${auth.currentUser.uid}/pictures`);
      const snapshot = await get(picturesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('[CodeNest] Raw picture data from database:', Object.keys(data).length, 'entries');
        
        const loadedPictures: Picture[] = Object.keys(data).map(key => {
          const pic = data[key];
          return {
            id: key,
            name: pic.name,
            base64Data: pic.base64Data,
            uploadedAt: pic.uploadedAt
          };
        });
        
        loadedPictures.sort((a, b) => b.uploadedAt - a.uploadedAt);
        setPictures(loadedPictures);
        console.log('[CodeNest] Loaded', loadedPictures.length, 'pictures');
      } else {
        setPictures([]);
        console.log('[CodeNest] No pictures found in database');
      }
    } catch (error: any) {
      console.error("[CodeNest] Error fetching pictures:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      
      let userMessage = "Failed to load pictures. ";
      if (error.code === 'PERMISSION_DENIED') {
        userMessage += "Please check Firebase Realtime Database rules.";
      } else {
        userMessage += "Please refresh the page.";
      }
      setActionError(userMessage);
    }
  };

  const fetchProfile = async () => {
    if (!auth.currentUser) {
      console.warn('[CodeNest] No authenticated user, skipping profile fetch');
      setUserProfile(null);
      return;
    }

    try {
      console.log('[CodeNest] Loading user profile from Firebase');
      const profileRef = dbRef(database, `profiles/${auth.currentUser.uid}`);
      const snapshot = await get(profileRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserProfile({
          name: data.name || auth.currentUser.email?.split('@')[0] || 'User',
          photoBase64: data.photoBase64 || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
        console.log('[CodeNest] Profile loaded:', data.name);
      } else {
        // No profile exists yet (legacy user) - create fallback profile
        console.log('[CodeNest] No profile found, creating fallback');
        const fallbackName = auth.currentUser.email?.split('@')[0] || 'User';
        setUserProfile({
          name: fallbackName,
          photoBase64: null
        });
      }
    } catch (error: any) {
      console.error('[CodeNest] Error fetching profile:', error);
      // Fallback on error
      const fallbackName = auth.currentUser?.email?.split('@')[0] || 'User';
      setUserProfile({
        name: fallbackName,
        photoBase64: null
      });
    }
  };

  const fetchSnippets = async () => {
    if (!auth.currentUser) {
      console.warn('[CodeNest] No authenticated user, skipping snippet fetch');
      setSnippets([]);
      return;
    }
    
    try {
      console.log('[CodeNest] Loading snippets from Firebase + localStorage');
      
      // Fetch snippet metadata from Firebase
      const snippetsRef = dbRef(database, `users/${auth.currentUser.uid}/snippets`);
      const snapshot = await get(snippetsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('[CodeNest] Raw snippet metadata from Firebase:', Object.keys(data).length, 'entries');
        
        // Combine Firebase metadata with localStorage code
        const loadedSnippets: CodeSnippet[] = Object.keys(data).map(key => {
          const meta = data[key];
          // Get code from localStorage
          const code = localStorage.getItem(`snippet_code_${key}`) || '';
          return {
            id: key,
            title: meta.title,
            language: meta.language,
            code: code,
            createdAt: meta.createdAt
          };
        });
        
        loadedSnippets.sort((a, b) => b.createdAt - a.createdAt);
        setSnippets(loadedSnippets);
        console.log('[CodeNest] Loaded', loadedSnippets.length, 'snippets (metadata from Firebase, code from localStorage)');
      } else {
        setSnippets([]);
        console.log('[CodeNest] No snippets found in Firebase');
      }
    } catch (error: any) {
      console.error("[CodeNest] Error fetching snippets:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      setSnippets([]);
    }
  };

  // Removed global Ctrl+V paste listener per user request

  // Load data on mount
  useEffect(() => {
    fetchSnippets();
    fetchPictures();
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleOpenAddSnippet = () => {
    console.log('[CodeNest] Add Snippet button clicked');
    setActionError(null);
    setIsAddModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAddSnippet = async (snippet: Omit<CodeSnippet, 'id' | 'createdAt'>) => {
    console.log('[CodeNest] Saving snippet - metadata to Firebase, code to localStorage');
    console.log('[CodeNest] Received snippet data:', { 
      title: snippet.title, 
      language: snippet.language, 
      codeLength: snippet.code.length 
    });
    
    if (!auth.currentUser) {
      setActionError('Your session has expired. Please sign in again.');
      showToast('Session expired. Please sign in again.', 'error');
      return;
    }
    
    try {
      setActionError(null);
      const id = Date.now().toString();
      
      // Save metadata (title, language, createdAt) to Firebase Realtime Database
      const snippetMetadata = {
        title: snippet.title,
        language: snippet.language,
        createdAt: Date.now()
      };
      
      console.log('[CodeNest] Saving metadata to Firebase:', snippetMetadata);
      await set(dbRef(database, `users/${auth.currentUser.uid}/snippets/${id}`), snippetMetadata);
      console.log('[CodeNest] Metadata saved to Firebase successfully');
      
      // Save code to localStorage (private, doesn't sync)
      localStorage.setItem(`snippet_code_${id}`, snippet.code);
      console.log('[CodeNest] Code saved to localStorage');
      
      // Refresh snippets list
      await fetchSnippets();
      console.log('[CodeNest] Snippet saved successfully with hybrid storage');
      
      // Show success toast
      showToast('Snippet saved successfully!', 'success');
    } catch (error: any) {
      console.error("[CodeNest] Error adding snippet:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      
      let userMessage = "We couldn't save that snippet. ";
      if (error.code === 'PERMISSION_DENIED') {
        userMessage += "Please check Firebase Realtime Database rules.";
      } else {
        userMessage += "Please try again.";
      }
      setActionError(userMessage);
      showToast('Failed to save snippet. Please try again.', 'error');
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!auth.currentUser) return;
    
    try {
      console.log('[CodeNest] Deleting snippet from Firebase + localStorage', id);
      
      // Delete metadata from Firebase
      await remove(dbRef(database, `users/${auth.currentUser.uid}/snippets/${id}`));
      console.log('[CodeNest] Snippet metadata deleted from Firebase');
      
      // Delete code from localStorage
      localStorage.removeItem(`snippet_code_${id}`);
      console.log('[CodeNest] Snippet code deleted from localStorage');
      
      // Refresh snippets list
      await fetchSnippets();
      console.log('[CodeNest] Snippet deleted successfully');
      
      // Show success toast
      showToast('Snippet deleted successfully!', 'success');
    } catch (error: any) {
      console.error("[CodeNest] Error deleting snippet:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      setActionError("Failed to delete snippet. Please try again.");
      showToast('Failed to delete snippet. Please try again.', 'error');
    }
  };

  const handleImageFileSelected = (file: File) => {
    console.log('[CodeNest] Image file selected:', file.name, 'Size:', file.size);
    setPendingImageFile(file);
    setIsNameModalOpen(true);
  };

  const handleSavePicture = async (name: string) => {
    if (!pendingImageFile || !auth.currentUser) {
      setIsNameModalOpen(false);
      return;
    }

    console.log('[CodeNest] Saving picture with name:', name);
    setIsProcessingImage(true);
    setActionError(null);

    try {
      // Compress and convert to base64
      console.log('[CodeNest] Compressing and converting image to base64...');
      const base64Data = await compressImage(pendingImageFile, 1200, 0.75);
      
      const base64Size = Math.round((base64Data.length * 3) / 4 / 1024);
      console.log('[CodeNest] Base64 size:', base64Size, 'KB');

      // Warn if too large
      if (base64Size > 1024) {
        console.warn('[CodeNest] Image is quite large:', base64Size, 'KB');
      }

      const id = Date.now().toString();
      const pictureData = {
        name: name,
        base64Data: base64Data,
        uploadedAt: Date.now()
      };

      // Save to Firebase Realtime Database
      console.log('[CodeNest] Saving picture to Firebase Realtime Database...');
      await set(dbRef(database, `users/${auth.currentUser.uid}/pictures/${id}`), pictureData);
      console.log('[CodeNest] Picture saved successfully to database');

      // Refresh pictures
      await fetchPictures();
      console.log('[CodeNest] Picture saved and gallery updated!');

      // Clean up
      setPendingImageFile(null);
      setIsNameModalOpen(false);
      
      // Show success toast
      showToast('Image uploaded successfully!', 'success');
    } catch (error: any) {
      console.error("[CodeNest] Error saving picture:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      
      let userMessage = "Failed to save picture. ";
      if (error.code === 'PERMISSION_DENIED') {
        userMessage += "Please check Firebase Realtime Database rules.";
      } else if (error.message.includes('quota')) {
        userMessage += "Database quota exceeded. Try a smaller image.";
      } else {
        userMessage += "Please try again.";
      }
      setActionError(userMessage);
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDeletePicture = async (id: string) => {
    if (!auth.currentUser) return;
    
    try {
      console.log('[CodeNest] Deleting picture from Firebase Realtime Database', id);
      
      await remove(dbRef(database, `users/${auth.currentUser.uid}/pictures/${id}`));
      console.log('[CodeNest] Picture deleted from database');
      
      // Refresh pictures
      await fetchPictures();
      console.log('[CodeNest] Picture deleted successfully');
      
      // Show success toast
      showToast('Image deleted successfully!', 'success');
    } catch (error: any) {
      console.error("[CodeNest] Error deleting picture:", error);
      console.error("[CodeNest] Error code:", error.code);
      console.error("[CodeNest] Error message:", error.message);
      setActionError("Failed to delete picture. Please try again.");
      showToast('Failed to delete image. Please try again.', 'error');
    }
  };

  const handleSaveProfile = async (name: string, photoBase64: string | null) => {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      console.log('[CodeNest] Saving profile...');
      const profileData: UserProfile = {
        name: name,
        photoBase64: photoBase64 !== null ? photoBase64 : (userProfile?.photoBase64 || null),
        createdAt: userProfile?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await set(dbRef(database, `profiles/${auth.currentUser.uid}`), profileData);
      console.log('[CodeNest] Profile saved successfully');

      // Update local state immediately
      setUserProfile(profileData);
      
      // Show success toast
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      console.error('[CodeNest] Error saving profile:', error);
      showToast('Failed to save profile. Please try again.', 'error');
      throw new Error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url("/ocean.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Light tinted overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-white/20 backdrop-blur-[2px]"></div>

      {/* Navbar */}
      <nav className="bg-surface backdrop-blur-md border-b border-border sticky top-0 z-40 relative">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-8 h-8 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Code2 size={17} />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-text-main tracking-tight truncate">CodeNest</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Profile Section */}
            {userProfile && auth.currentUser && (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 min-h-[44px] px-2 sm:px-3 py-1.5 hover:bg-surface-light rounded-lg transition-colors group"
                >
                  {/* Avatar */}
                  {userProfile.photoBase64 ? (
                    <img
                      src={userProfile.photoBase64}
                      alt={userProfile.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold border border-border">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Name - hidden on very small screens */}
                  <span className="hidden sm:block text-sm font-medium text-text-main group-hover:text-primary transition-colors max-w-[120px] truncate">
                    {userProfile.name}
                  </span>
                  
                  <ChevronDown size={14} className="hidden sm:block text-text-muted group-hover:text-primary transition-colors" />
                </button>

                <ProfileDropdown
                  isOpen={showProfileDropdown}
                  onClose={() => setShowProfileDropdown(false)}
                  name={userProfile.name}
                  email={auth.currentUser.email || ''}
                  photoBase64={userProfile.photoBase64}
                  onEditProfile={() => setShowEditProfileModal(true)}
                  anchorEl={profileButtonRef.current}
                />
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 min-h-[44px] text-text-muted hover:text-primary transition-colors text-sm font-medium px-2 sm:px-3 py-1.5 hover:bg-surface-light rounded-lg"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        
        {/* Tabs */}
        <div className="flex bg-surface backdrop-blur-md border border-border p-1 rounded-xl mb-6 sm:mb-8 w-full sm:w-max shadow-sm">
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'snippets' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-text-main hover:bg-surface-light'
            }`}
          >
            <Terminal size={16} />
            <span className="whitespace-nowrap">Code Snippets</span>
          </button>
          <button
            onClick={() => setActiveTab('pictures')}
            className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'pictures' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-text-main hover:bg-surface-light'
            }`}
          >
            <ImageIcon size={16} />
            <span className="whitespace-nowrap">Pictures</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'snippets' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-surface backdrop-blur-md rounded-xl px-4 py-3 border border-border">
              <h2 className="text-lg sm:text-xl font-semibold text-text-main">Your Snippets</h2>
              <button
                type="button"
                onClick={handleOpenAddSnippet}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm min-h-[44px]"
              >
                <Plus size={18} />
                <span>Add Snippet</span>
              </button>
            </div>

            {snippets.length === 0 ? (
              <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <Terminal size={32} />
                </div>
                <h3 className="text-text-main font-medium mb-1">No snippets found</h3>
                <p className="text-text-muted text-sm max-w-sm mb-6">
                  You haven't saved any code snippets yet. Create your first snippet to get started.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSnippet}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Create Snippet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {snippets.map((snippet) => (
                  <CodeEntryCard 
                    key={snippet.id} 
                    snippet={snippet} 
                    onDelete={handleDeleteSnippet} 
                  />
                ))}
              </div>
            )}

            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-3 rounded-lg text-sm font-medium">
                {actionError}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pictures' && (
          <ImageGallery 
            pictures={pictures} 
            onUpload={handleImageFileSelected}
            onDelete={handleDeletePicture}
            isProcessing={isProcessingImage}
            onDownload={() => showToast('Image downloaded successfully!', 'success')}
          />
        )}
      </main>

      <AddSnippetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddSnippet}
      />

      <NamePictureModal
        isOpen={isNameModalOpen}
        onClose={() => {
          setIsNameModalOpen(false);
          setPendingImageFile(null);
        }}
        onSave={handleSavePicture}
        isProcessing={isProcessingImage}
      />

      {/* Edit Profile Modal */}
      {userProfile && auth.currentUser && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          onSave={handleSaveProfile}
          currentName={userProfile.name}
          currentEmail={auth.currentUser.email || ''}
          currentPhoto={userProfile.photoBase64}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-xl p-5 sm:p-6 max-w-sm w-full max-h-[calc(100vh-2rem)] overflow-y-auto text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2">Are you sure you want to logout?</h3>
            <p className="text-text-muted text-sm mb-6">You will be redirected to the login page.</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="min-h-[44px] px-5 py-2 text-text-muted hover:bg-surface-light rounded-lg font-medium transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="min-h-[44px] px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
