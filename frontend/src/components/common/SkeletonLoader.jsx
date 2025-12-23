// Tournament Card Skeleton
export const TournamentCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-2 bg-gray-200 rounded w-full mb-3"></div>
      <div className="flex justify-between pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
};

// Player Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
      
      <div className="px-4 py-4 space-y-4">
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-32"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-36"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="h-16 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Tournament Details Skeleton
export const TournamentDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      
      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Match Card Skeleton
export const MatchCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-28"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
};

// Generic List Skeleton
export const ListSkeleton = ({ items = 3, height = 'h-16' }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className={`bg-white rounded-lg border border-gray-100 p-4 animate-pulse ${height}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};