import { useAlbums } from "../hooks/useAlbums";
import { AlbumView } from "./AlbumView";

interface AlbumGridProps {}

export const AlbumGrid = ({}: AlbumGridProps) => {
  const { albums, error } = useAlbums();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!albums || albums.length === 0) {
    return (
      <div className="text-center text-neutral-400 mt-8">
        No albums found in database. Start an ingestion to populate your
        library.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{albums.length} Albums</h2>
      <div className="grid p-2 gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {albums?.map((album) => (
          <AlbumView key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};
