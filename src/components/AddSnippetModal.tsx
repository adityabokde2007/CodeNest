import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type CodeSnippet } from '../lib/storage';

interface AddSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippet: Omit<CodeSnippet, 'id' | 'createdAt'>) => void;
}

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'HTML', 'CSS', 'SQL', 'Bash', 'Other'];

const AddSnippetModal: React.FC<AddSnippetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setLanguage(LANGUAGES[0]);
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[AddSnippetModal] Form submitted');
    console.log('[AddSnippetModal] Title:', title);
    console.log('[AddSnippetModal] Language:', language);
    console.log('[AddSnippetModal] Code length:', code.length);
    
    if (!title.trim() || !code.trim()) {
      console.warn('[AddSnippetModal] Validation failed - empty title or code');
      return;
    }

    // Max 1000 lines
    const lineCount = code.trim().split('\n').length;
    if (lineCount > 1000) {
      alert(`Code exceeds 1000 lines (${lineCount} lines). Please shorten it.`);
      return;
    }
    
    const snippetData = { 
      title: title.trim(), 
      language, 
      code: code.trim() 
    };
    
    console.log('[AddSnippetModal] Calling onSave with:', snippetData);
    onSave(snippetData);
    
    // Reset form
    setTitle('');
    setLanguage(LANGUAGES[0]);
    setCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface backdrop-blur-xl border border-border w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg sm:text-xl font-bold text-text-main">Add New Snippet</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-text-muted hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. OS Practical 3"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface-light text-text-main placeholder-text-muted/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface-light text-text-main"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="text-gray-900 bg-white">{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[150px] sm:min-h-[300px]">
            <label className="block text-sm font-medium text-text-main mb-1">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full flex-1 p-3 font-mono text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none bg-surface-light text-text-main placeholder-text-muted/60"
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-text-muted hover:bg-surface-light border border-border rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !code.trim()}
              className="min-h-[44px] px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Save Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSnippetModal;
