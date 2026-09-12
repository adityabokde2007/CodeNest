import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, Trash2, Image as ImageIcon, AlertTriangle, Download, Eye } from 'lucide-react';
import { type Picture } from '../lib/storage';

interface ImageGalleryProps {
  pictures: Picture[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => Promise<void> | void;
  isProcessing?: boolean;
  onDownload?: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  pictures, 
  onUpload, 
  onDelete,
  isProcessing = false,
  onDownload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<Picture | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenUpload = () => {
    console.log('[CodeNest] Upload Image button clicked');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[CodeNest] File picker returned a file', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    // Check file size (warn if > 5MB as it will create large base64)
    if (file.size > 5 * 1024 * 1024) {
      const confirmLarge = confirm("This image is quite large (over 5MB). It will be compressed, but consider using a smaller image for better performance. Continue?");
      if (!confirmLarge) return;
    }

    onUpload(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (picture: Picture) => {
    console.log('[CodeNest] Downloading picture:', picture.name);
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = picture.base64Data;
    link.download = `${picture.name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[CodeNest] Download triggered');
    
    // Notify parent component
    if (onDownload) {
      onDownload();
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    console.log('[CodeNest] Deleting picture:', id);
    await onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-surface backdrop-blur-md rounded-xl px-4 py-3 border border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-text-main">Your Pictures</h2>
        </div>
        <button
          type="button"
          onClick={handleOpenUpload}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
        >
          <Upload size={18} />
          <span>{isProcessing ? 'Processing...' : 'Upload Image'}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {pictures.length === 0 ? (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-text-main font-medium mb-1">No pictures yet</h3>
          <p className="text-text-muted text-sm max-w-sm mb-6">
            Upload your first image to see it here. Images are stored securely in your Firebase database.
          </p>
          <button
            type="button"
            onClick={handleOpenUpload}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Upload Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pictures.map((pic) => (
            <div key={pic.id} className="group relative bg-surface-light backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-surface">
                <img
                  src={pic.base64Data}
                  alt={pic.name}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedImage(pic)}
                />
              </div>
              
              {/* Name */}
              <div className="p-3 border-t border-border">
                <p className="text-sm font-medium text-text-main truncate" title={pic.name}>
                  {pic.name}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelectedImage(pic)}
                  className="w-11 h-11 lg:w-9 lg:h-9 bg-white/90 text-gray-700 hover:text-primary hover:bg-white rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm"
                  title="View Fullscreen"
                >
                  <Eye size={18} className="lg:scale-90" />
                </button>
                <button
                  onClick={() => handleDownload(pic)}
                  className="w-11 h-11 lg:w-9 lg:h-9 bg-white/90 text-gray-700 hover:text-primary hover:bg-white rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm"
                  title="Download Image"
                >
                  <Download size={18} className="lg:scale-90" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(pic.id)}
                  className="w-11 h-11 lg:w-9 lg:h-9 bg-white/90 text-red-600 hover:bg-red-50 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm"
                  title="Delete Image"
                >
                  <Trash2 size={18} className="lg:scale-90" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(selectedImage); }}
                className="p-3 text-white hover:text-primary bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm"
                title="Download"
              >
                <Download size={24} />
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-3 text-white hover:text-primary bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-center mb-4">
              <p className="text-white text-lg font-semibold">{selectedImage.name}</p>
            </div>
            <img
              src={selectedImage.base64Data}
              alt={selectedImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      , document.body)}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-xl p-5 sm:p-6 max-w-sm w-full max-h-[calc(100vh-2rem)] overflow-y-auto text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2">Are you sure you want to delete this picture?</h3>
            <p className="text-text-muted text-sm mb-6">This action cannot be undone.</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="min-h-[44px] px-5 py-2 text-text-muted hover:bg-surface-light rounded-lg font-medium transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="min-h-[44px] px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
};

export default ImageGallery;
