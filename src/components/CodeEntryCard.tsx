import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Trash2, Check, AlertTriangle, Eye, X } from 'lucide-react';
import { type CodeSnippet } from '../lib/storage';

interface CodeEntryCardProps {
  snippet: CodeSnippet;
  onDelete: (id: string) => void;
}

const CodeEntryCard: React.FC<CodeEntryCardProps> = ({ snippet, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-surface-light backdrop-blur-xl rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-2 px-3 sm:px-4 py-3 bg-surface">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h3 className="font-semibold text-text-main truncate">{snippet.title}</h3>
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              {snippet.language}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setIsViewing(true)}
              className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="View Code"
            >
              <Eye size={18} className="sm:scale-90" />
            </button>
            <button
              onClick={handleCopy}
              className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={18} className="text-green-500 sm:scale-90" /> : <Copy size={18} className="sm:scale-90" />}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Snippet"
            >
              <Trash2 size={18} className="sm:scale-90" />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {isViewing && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsViewing(false)}>
          <div className="bg-[#1E1E1E] rounded-xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-[#333]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 px-3 sm:px-4 py-3 bg-[#2D2D2D] border-b border-[#444]">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <h3 className="font-semibold text-white truncate">{snippet.title}</h3>
                <span className="px-2.5 py-1 rounded-md bg-[#444] text-gray-300 text-xs font-medium">
                  {snippet.language}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="min-h-[44px] px-2 sm:px-3 py-2 sm:py-1.5 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-[#444] rounded-md transition-colors text-sm"
                >
                  {copied ? <Check size={16} className="text-green-500 sm:scale-90" /> : <Copy size={16} className="sm:scale-90" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setIsViewing(false)}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#444] rounded-md transition-colors"
                >
                  <X size={20} className="sm:scale-90" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <SyntaxHighlighter
                language={snippet.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875rem'
                }}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-xl p-5 sm:p-6 max-w-sm w-full max-h-[calc(100vh-2rem)] overflow-y-auto text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2">Are you sure you want to delete this?</h3>
            <p className="text-text-muted text-sm mb-6">"{snippet.title}" will be permanently removed.</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="min-h-[44px] px-5 py-2 text-text-muted hover:bg-surface-light rounded-lg font-medium transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(snippet.id); setShowDeleteConfirm(false); }}
                className="min-h-[44px] px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default CodeEntryCard;
