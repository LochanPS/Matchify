import React, { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { handleShare, getAvailablePlatforms } from '../../utils/socialSharing';

const SocialShareModal = ({ isOpen, onClose, shareData, title = "Share" }) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState('');
  
  const platforms = getAvailablePlatforms();
  
  const handlePlatformShare = async (platform) => {
    setSharing(true);
    
    try {
      await handleShare(
        platform, 
        shareData,
        (successMessage) => {
          setMessage(successMessage);
          if (platform === 'copy') {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        },
        (errorMessage) => {
          setMessage(`Error: ${errorMessage}`);
        }
      );
    } catch (error) {
      setMessage(`Failed to share: ${error.message}`);
    } finally {
      setSharing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={sharing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Share Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Preview:</h4>
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">{shareData.title}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{shareData.description}</p>
            <p className="text-xs text-blue-600 break-all">{shareData.url}</p>
            {shareData.hashtags && shareData.hashtags.length > 0 && (
              <p className="text-xs text-blue-500">
                {shareData.hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            )}
          </div>
        </div>
        
        {/* Platform Buttons */}
        <div className="space-y-3">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformShare(platform.id)}
              disabled={sharing}
              className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                sharing 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
              style={{
                borderColor: platform.color + '20',
                backgroundColor: platform.id === 'copy' && copied ? '#10B981' + '10' : 'transparent'
              }}
            >
              <span className="text-xl">{platform.icon}</span>
              <span className="flex-1 text-left font-medium">
                {platform.id === 'copy' && copied ? 'Copied!' : platform.name}
              </span>
              {platform.id === 'copy' && copied && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
        
        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.startsWith('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
        
        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Sharing Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Share on WhatsApp for quick friend invites</li>
            <li>• Use Facebook for broader community reach</li>
            <li>• Twitter is great for public announcements</li>
            <li>• Copy link to share anywhere you want</li>
          </ul>
        </div>
        
        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={sharing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;