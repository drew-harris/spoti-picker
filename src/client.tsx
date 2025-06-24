import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { Homepage } from "./pages/Homepage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Speed up development
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster invert className="bg-neutral-800 text-white" />
    </QueryClientProvider>,
  );
});
