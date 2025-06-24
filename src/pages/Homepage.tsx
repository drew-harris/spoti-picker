import type { InferRouterOutputs } from "@orpc/server";
import { useQuery } from "@tanstack/react-query";
import type { router } from "../api";
import { orpc } from "../fetcher";

export type Album = InferRouterOutputs<typeof router>["album"]["getAlbums"][0];

export const AlbumView = ({ album }: { album: Album }) => {
  return (
    <div className="border border-neutral-800 text-center flex flex-col items-center p-2 rounded">
      <h1>{album.album.name}</h1>
      <img className="w-50 h-50" src={album.album.images[1]?.url} />
    </div>
  );
};

export const Homepage = () => {
  const { data } = useQuery(orpc.album.getAlbums.queryOptions());

  return (
    <div className="h-screen">
      <div className="grid gap-2 grid-cols-4">
        {data?.map((album) => (
          <AlbumView key={album.album.id} album={album} />
        ))}
      </div>
    </div>
  );
};
