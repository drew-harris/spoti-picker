import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "../fetcher";

export const Homepage = () => {
  const { data, error } = useSuspenseQuery(orpc.album.getAlbums.queryOptions());

  return (
    <div className="grid place-items-center h-screen">
      <div>
        {data?.items?.map((album) => (
          <div key={album.album.id}>{album.album.name}</div>
        ))}
      </div>
      <div></div>
    </div>
  );
};
