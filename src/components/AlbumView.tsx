import type { InferRouterOutputs } from "@orpc/server";
import type { router } from "../api";

export type AlbumFromDb = InferRouterOutputs<typeof router>["album"]["getAlbumsFromDatabase"][0];

export const AlbumView = ({ album }: { album: AlbumFromDb }) => {
  return (
    <a
      href={album.url}
      className="border border-neutral-800 text-center flex flex-col items-center p-2 rounded hover:border-neutral-600 transition-colors"
    >
      <h1 className="text-sm font-medium mb-2">{album.name}</h1>
      <img className="w-30 h-30 md:w-50 md:h-50 rounded" src={album.img} alt={album.name} />
      {album.artist && (
        <p className="text-xs text-neutral-400 mt-1">{album.artist}</p>
      )}
    </a>
  );
}; 