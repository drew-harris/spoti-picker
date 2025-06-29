import { useQuery } from "@tanstack/react-query";
import { AlbumGrid } from "../components/AlbumGrid";
import { IngestionControls } from "../components/IngestionControls";
import { IngestionProgressView } from "../components/IngestionProgressView";
import { RandomAlbumDisplay } from "../components/RandomAlbumDisplay";
import { orpc } from "../fetcher";

export const Homepage = () => {
  // Queries
  const { data: ingestionProgress } = useQuery(
    orpc.album.getIngestionProgress.queryOptions(),
  );
  const { data: isDev } = useQuery(orpc.isDev.queryOptions());

  return (
    <div className="h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Spotify Album Picker</h1>

        {/* Ingestion Controls */}
        <div className="absolute top-2 right-2">
          <IngestionControls />
        </div>

        {/* Ingestion Progress - only show if not completed */}
        {ingestionProgress && ingestionProgress.status !== "completed" && (
          <IngestionProgressView progress={ingestionProgress} />
        )}
      </div>
      <RandomAlbumDisplay />
      <AlbumGrid />
      {isDev && (
        <div className="fixed bottom-4 right-4 bg-yellow-600 text-black px-2 py-1 rounded text-xs">
          Dev mode
        </div>
      )}
    </div>
  );
};
