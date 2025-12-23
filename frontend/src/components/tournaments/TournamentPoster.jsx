import { useState } from 'react';
import { Image, X, Share2, Download, Maximize2 } from 'lucide-react';

const TournamentPoster = ({ 
  posterUrl, 
  tournamentName, 
  fallbackContent,
  className = '',
  showActions = false,
  onShare,
  onDownload
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleShare = async () => {
    if (navigator.share && posterUrl) {
      try {
        await navigator.share({
          title: `${tournamentName} - Tournament Poster`,
          text: `Check out this tournament: ${tournamentName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else if (onShare) {
      onShare();
    }
  };

  const handleDownload = () => {
    if (posterUrl) {
      const link = document.createElement('a');
      link.href = posterUrl;
      link.download = `${tournamentName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_poster.jpg`;
      link.click();
    } else if (onDownload) {
      onDownload();
    }
  };

  // Default fallback content
  const DefaultFallback = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center text-white p-6">
      <div className="text-center space-y-4">
        <div className="p-4 bg-white bg-opacity-20 rounded-full">
          <Image className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">{tournamentName}</h3>
          <p className="text-blue-100">Tournament Poster</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        {posterUrl && !imageError ? (
          <>
            {/* Loading State */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="text-sm text-gray-500">Loading poster...</div>
                </div>
              </div>
            )}

            {/* Actual Image */}
            <img
              src={posterUrl}
              alt={`${tournamentName} poster`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />

            {/* Overlay Actions */}
            {showActions && imageLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                    title="View fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={handleShare}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                      title="Share poster"
                    >
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                    title="Download poster"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Fallback Content
          <div className="w-full h-full">
            {fallbackContent || <DefaultFallback />}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && posterUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={posterUrl}
              alt={`${tournamentName} poster`}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
              
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Preset sizes for common use cases
export const PosterSizes = {
  thumbnail: 'w-24 h-16 rounded-lg',
  card: 'w-full h-48 rounded-lg',
  hero: 'w-full h-64 md:h-80 lg:h-96 rounded-xl',
  fullWidth: 'w-full aspect-[1200/630] rounded-xl',
};

// Wrapper component with preset sizes
export const TournamentPosterCard = ({ size = 'card', ...props }) => (
  <TournamentPoster className={PosterSizes[size]} {...props} />
);

export const TournamentPosterThumbnail = (props) => (
  <TournamentPoster className={PosterSizes.thumbnail} {...props} />
);

export const TournamentPosterHero = (props) => (
  <TournamentPoster 
    className={PosterSizes.hero} 
    showActions={true}
    {...props} 
  />
);

export default TournamentPoster;