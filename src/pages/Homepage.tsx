import type { InferRouterOutputs } from "@orpc/server";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { router } from "../api";
import { orpc } from "../fetcher";

export type Album = InferRouterOutputs<typeof router>["album"]["getAlbums"][0];

export const AlbumView = ({ album }: { album: Album }) => {
  return (
    <a
      href={album.url}
      className="border border-neutral-800 text-center flex flex-col items-center p-2 rounded"
    >
      <h1>{album.name}</h1>
      <img className="w-30 h-30 md:w-50 md:h-50" src={album.img} />
    </a>
  );
};

export const Homepage = () => {
  const { data } = useQuery(orpc.album.getAlbums.queryOptions());
  const [randomNum, setRandomNum] = useState(Math.floor(Math.random() * 100));

  return (
    <div className="h-screen">
      {data && (
        <AlbumView key={data?.at(randomNum)!.id} album={data?.at(randomNum)!} />
      )}
      <div className="grid p-2 gap-2 grid-cols-2 md:grid-cols-4">
        {data?.map((album) => (
          <AlbumView key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};
