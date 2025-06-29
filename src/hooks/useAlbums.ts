import { useQuery } from "@tanstack/react-query";
import { orpc } from "../fetcher";

export const useAlbums = () => {
  const {
    data: albums,
    status,
    error,
  } = useQuery(orpc.album.getAlbumsFromDatabase.queryOptions());

  return { albums, status, error };
};
