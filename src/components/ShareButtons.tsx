'use client';

import { useState } from 'react';
import { Facebook, MessageCircle, Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  className?: string;
}

export default function ShareButtons({
  url,
  title = 'אתר הנצחה - אלכס שטרית ז״ל',
  className = '',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showInstagramHelp, setShowInstagramHelp] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInstagramShare = async () => {
    // Check if Web Share API is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Desktop: copy link and show explanation
      await handleCopyLink();
      setShowInstagramHelp(true);
      setTimeout(() => setShowInstagramHelp(false), 5000);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-600 hidden sm:inline">שיתוף:</span>
      
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity"
        aria-label="שיתוף ב-Facebook"
        title="שיתוף ב-Facebook"
      >
        <Facebook size={20} />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity"
        aria-label="שיתוף ב-WhatsApp"
        title="שיתוף ב-WhatsApp"
      >
        <MessageCircle size={20} />
      </a>

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-black text-white hover:opacity-80 transition-opacity"
        aria-label="שיתוף ב-X"
        title="שיתוף ב-X"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Instagram (with special handling) */}
      <button
        onClick={handleInstagramShare}
        className="p-2 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-80 transition-opacity relative"
        aria-label="שיתוף ב-Instagram"
        title="שיתוף ב-Instagram"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        
        {showInstagramHelp && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
            <p className="text-center">
              הקישור הועתק! פתחו את Instagram והדביקו בסטורי או בפוסט
            </p>
          </div>
        )}
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-full transition-all ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="העתקת קישור"
        title="העתקת קישור"
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
      </button>

      {copied && (
        <span className="text-sm text-green-600 animate-fade-in">
          הועתק!
        </span>
      )}
    </div>
  );
}
