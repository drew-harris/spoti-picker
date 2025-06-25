import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../fetcher";

interface IngestionControlsProps {
  albumsCount: number;
}

export const IngestionControls = ({ albumsCount }: IngestionControlsProps) => {
  const queryClient = useQueryClient();

  const startIngestionMutation = useMutation({
    mutationFn: () => orpc.album.startIngestion.call(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.album.getIngestionProgress.queryKey() });
      queryClient.invalidateQueries({ queryKey: orpc.album.getAlbumsFromDatabase.queryKey() });
    },
  });

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => startIngestionMutation.mutate()}
        disabled={startIngestionMutation.isPending}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {startIngestionMutation.isPending ? 'Starting...' : 'Start Album Ingestion'}
      </button>
    </div>
  );
}; 