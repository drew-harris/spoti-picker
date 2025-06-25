import { AlbumView, type AlbumFromDb } from "./AlbumView";

interface AlbumGridProps {
  albums: AlbumFromDb[];
  title?: string;
}

export const AlbumGrid = ({ albums, title = "All Albums" }: AlbumGridProps) => {
  if (!albums || albums.length === 0) {
    return (
      <div className="text-center text-neutral-400 mt-8">
        No albums found in database. Start an ingestion to populate your library.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {title} ({albums.length})
      </h2>
      <div className="grid p-2 gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {albums.map((album) => (
          <AlbumView key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}; 