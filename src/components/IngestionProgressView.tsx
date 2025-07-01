import type { Ingestion } from "../lib/ingestion";

export const IngestionProgressView = ({
  progress,
}: { progress: Ingestion.IngestionProgress }) => {
  const percentage =
    progress.totalAlbums > 0
      ? Math.round((progress.processedAlbums / progress.totalAlbums) * 100)
      : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Album Ingestion Progress</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            progress.status === "completed"
              ? "bg-green-600 text-white"
              : progress.status === "failed"
                ? "bg-red-600 text-white"
                : progress.status === "in_progress"
                  ? "bg-blue-600 text-white"
                  : "bg-yellow-600 text-black"
          }`}
        >
          {progress.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-neutral-400 mb-1">
          <span>Progress</span>
          <span>
            {progress.processedAlbums} / {progress.totalAlbums}
          </span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {progress.errorMessage && (
        <div className="text-red-400 text-sm mt-2">
          Error: {progress.errorMessage}
        </div>
      )}

      <div className="text-xs text-neutral-500">
        Started: {new Date(progress.startedAt).toLocaleString()}
        {progress.completedAt && (
          <span className="ml-4">
            Completed: {new Date(progress.completedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

