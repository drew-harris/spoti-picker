import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../fetcher";
import { useAlbums } from "../hooks/useAlbums";

export const IngestionControls = () => {
  const queryClient = useQueryClient();
  const { albums } = useAlbums();

  const startIngestionMutation = useMutation({
    mutationFn: () => orpc.album.startIngestion.call(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.album.getIngestionProgress.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: orpc.album.getAlbumsFromDatabase.queryKey(),
      });
    },
  });

  return (
    <button
      onClick={() => startIngestionMutation.mutate()}
      disabled={startIngestionMutation.isPending}
      className="px-2 py-1 bg-neutral-700 text-sm text-white rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {startIngestionMutation.isPending
        ? "Starting..."
        : "Start Album Ingestion"}
    </button>
  );
};
