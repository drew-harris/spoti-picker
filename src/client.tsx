import "./styles.css";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { RequireAuthLayout } from "./layouts/RequireAuth";
import { Homepage } from "./pages/Homepage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 1000 * 60 * 60 * 1, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuthLayout>
        <Homepage />
      </RequireAuthLayout>
    ),
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
    >
      <RouterProvider router={router} />
      <Toaster invert className="bg-neutral-800 text-white" />
    </PersistQueryClientProvider>,
  );
});
