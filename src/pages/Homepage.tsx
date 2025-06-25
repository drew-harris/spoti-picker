import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlbumGrid } from "../components/AlbumGrid";
import { IngestionControls } from "../components/IngestionControls";
import { IngestionProgressView } from "../components/IngestionProgressView";
import { RandomAlbumDisplay } from "../components/RandomAlbumDisplay";
import { orpc } from "../fetcher";

export const Homepage = () => {
  const [albumHistory, setAlbumHistory] = useState<number[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Queries
  const { data: albums } = useQuery(
    orpc.album.getAlbumsFromDatabase.queryOptions(),
  );
  const { data: ingestionProgress } = useQuery(
    orpc.album.getIngestionProgress.queryOptions(),
  );
  const { data: isDev } = useQuery(orpc.isDev.queryOptions());

  // Get current album from history or generate a new random one
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
    <div className="h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Spotify Album Picker</h1>

        {/* Ingestion Controls */}
        <div className="absolute top-2 right-2">
          <IngestionControls albumsCount={albums?.length || 0} />
        </div>

        {/* Ingestion Progress - only show if not completed */}
        {ingestionProgress && ingestionProgress.status !== "completed" && (
          <IngestionProgressView progress={ingestionProgress} />
        )}
      </div>
      {/* Random Album Display */}
      {currentAlbum && (
        <RandomAlbumDisplay
          album={currentAlbum}
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
        />
      )}
      {/* Album Grid */}
      <AlbumGrid albums={albums || []} />
      {isDev && (
        <div className="fixed bottom-4 right-4 bg-yellow-600 text-black px-2 py-1 rounded text-xs">
          Dev mode
        </div>
      )}
    </div>
  );
};
