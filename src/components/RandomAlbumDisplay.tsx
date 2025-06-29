import { useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { type AlbumFromDb, AlbumView } from "./AlbumView";

export const RandomAlbumDisplay = () => {
  const { albums } = useAlbums();
  const [albumHistory, setAlbumHistory] = useState<number[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const getCurrentAlbumIndex = () => {
    if (
      currentHistoryIndex >= 0 &&
      albumHistory[currentHistoryIndex] !== undefined
    ) {
      return albumHistory[currentHistoryIndex];
    }
    return Math.floor(Math.random() * (albums?.length || 1));
  };

  const currentAlbum = albums?.at(getCurrentAlbumIndex());

  const handleNext = () => {
    if (!albums?.length) return;

    const newRandomIndex = Math.floor(Math.random() * albums.length);

    // Add to history, removing any future history if we're not at the end
    const newHistory = albumHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newRandomIndex);

    setAlbumHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (currentHistoryIndex >= 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const canGoBack = currentHistoryIndex >= 0;
  const canGoNext = Boolean(albums && albums.length > 0);
  return (
    <div className="mb-6 relative">
      <h2 className="text-xl font-semibold mb-4">Random Pick</h2>
      <div className="flex items-center justify-center">
        {/* Back Arrow */}
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          ←
        </button>

        {/* Album Display */}
        <div className="flex justify-center">
          {currentAlbum !== undefined && <AlbumView album={currentAlbum} />}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
};
