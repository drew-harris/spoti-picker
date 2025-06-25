import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "../fetcher";
import { AlbumView, type AlbumFromDb } from "../components/AlbumView";
import { IngestionProgressView } from "../components/IngestionProgressView";
import { AlbumGrid } from "../components/AlbumGrid";
import { RandomAlbumDisplay } from "../components/RandomAlbumDisplay";
import { IngestionControls } from "../components/IngestionControls";

export const Homepage = () => {
  const [randomNum, setRandomNum] = useState(Math.floor(Math.random() * 100));

  // Queries
  const { data: albums } = useQuery(orpc.album.getAlbumsFromDatabase.queryOptions());
  const { data: ingestionProgress } = useQuery(orpc.album.getIngestionProgress.queryOptions());
  const { data: isDev } = useQuery(orpc.isDev.queryOptions());

  const currentAlbum = albums?.at(randomNum);

  const handleRandomPick = () => {
    setRandomNum(Math.floor(Math.random() * (albums?.length || 1)));
  };

  return (
    <div className="h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Spotify Album Picker</h1>

        {/* Ingestion Controls */}
        <IngestionControls 
          onRandomPick={handleRandomPick}
          albumsCount={albums?.length || 0}
        />

        {/* Ingestion Progress - only show if not completed */}
        {ingestionProgress && ingestionProgress.status !== 'completed' && (
          <IngestionProgressView progress={ingestionProgress} />
        )}
      </div>

      {/* Random Album Display */}
      {currentAlbum && (
        <RandomAlbumDisplay album={currentAlbum} />
      )}

      {/* Album Grid */}
      <AlbumGrid albums={albums || []} />

      {isDev && <div className="fixed bottom-4 right-4 bg-yellow-600 text-black px-2 py-1 rounded text-xs">Dev mode</div>}
    </div>
  );
};
