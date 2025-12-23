import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle2, Crop, Download } from 'lucide-react';
import { posterAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PosterUpload = ({ 
  tournamentId,
  currentPosterUrl, 
  onUploadSuccess,
  onRemoveSuccess, 
  maxSizeBytes = 5 * 1024 * 1024, // 5MB to match backend
  recommendedDimensions = { width: 1200, height: 630 }
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentPosterUrl || null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please upload a JPG, PNG, or WebP image');
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${Math.round(maxSizeBytes / (1024 * 1024))}MB`);
    }

    return errors;
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file) => {
    setError('');
    setIsLoading(true);
    
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setIsLoading(false);
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload file
      setUploadProgress(50);
      const response = currentPosterUrl 
        ? await posterAPI.replace(tournamentId, file)
        : await posterAPI.upload(tournamentId, file);
      
      setUploadProgress(100);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.poster_url);
      }

      // Clean up
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setPreview(currentPosterUrl || null);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemovePoster = async () => {
    if (!window.confirm('Are you sure you want to remove the tournament poster?')) {
      return;
    }

    try {
      setIsLoading(true);
      await posterAPI.remove(tournamentId);
      setPreview(null);
      
      if (onRemoveSuccess) {
        onRemoveSuccess();
      }
    } catch (err) {
      console.error('Remove error:', err);
      setError(err.message || 'Failed to remove poster');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple template canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = recommendedDimensions.width;
    canvas.height = recommendedDimensions.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 50, canvas.width - 100, 150);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOURNAMENT NAME', canvas.width / 2, 140);

    ctx.font = '24px Arial';
    ctx.fillText('Date • Venue • City', canvas.width / 2, 180);

    // Info boxes
    const boxWidth = (canvas.width - 200) / 3;
    const boxHeight = 100;
    const boxY = canvas.height - 200;

    ['SINGLES', 'DOUBLES', 'MIXED'].forEach((text, index) => {
      const x = 50 + index * (boxWidth + 25);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x, boxY, boxWidth, boxHeight);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, x + boxWidth / 2, boxY + 40);
      
      ctx.font = '16px Arial';
      ctx.fillText('₹500 Entry', x + boxWidth / 2, boxY + 65);
      ctx.fillText('₹3000 Prize', x + boxWidth / 2, boxY + 85);
    });

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tournament-poster-template.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-4">
      {/* Current Poster Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Tournament poster"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleRemovePoster}
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white rounded-lg p-4 text-center">
                <LoadingSpinner size="md" />
                <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : preview
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {isLoading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {preview ? 'Replace Poster' : 'Upload Tournament Poster'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop an image here, or click to select
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Recommended: {recommendedDimensions.width}×{recommendedDimensions.height}px</p>
            <p>Formats: JPG, PNG, WebP • Max size: {Math.round(maxSizeBytes / (1024 * 1024))}MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-900">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-900">Poster uploaded successfully!</p>
        </div>
      )}

      {/* Helper Actions */}
      <div className="flex gap-2">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Image className="w-4 h-4" />
          {preview ? 'Change Poster' : 'Select Image'}
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Poster Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-contrast colors for better readability</li>
          <li>• Include tournament name, date, and venue prominently</li>
          <li>• Show category information and entry fees</li>
          <li>• Keep text large enough to read on mobile devices</li>
          <li>• Use the template as a starting point</li>
        </ul>
      </div>
    </div>
  );
};

export default PosterUpload;