import { type AlbumFromDb, AlbumView } from "./AlbumView";

interface RandomAlbumDisplayProps {
  album: AlbumFromDb;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

export const RandomAlbumDisplay = ({
  album,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
}: RandomAlbumDisplayProps) => {
  return (
    <div className="mb-6 relative">
      <h2 className="text-xl font-semibold mb-4">Random Pick</h2>
      <div className="flex items-center justify-center">
        {/* Back Arrow */}
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          ←
        </button>

        {/* Album Display */}
        <div className="flex justify-center">
          <AlbumView album={album} />
        </div>

        {/* Next Arrow */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
};

