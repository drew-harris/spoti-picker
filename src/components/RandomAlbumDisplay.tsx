import { AlbumView, type AlbumFromDb } from "./AlbumView";

interface RandomAlbumDisplayProps {
  album: AlbumFromDb;
}

export const RandomAlbumDisplay = ({ album }: RandomAlbumDisplayProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Random Pick</h2>
      <div className="flex justify-center">
        <AlbumView album={album} />
      </div>
    </div>
  );
}; 