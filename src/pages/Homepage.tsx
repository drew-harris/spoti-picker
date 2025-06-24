import { useQuery } from "@tanstack/react-query";
import { authClient } from "../auth-client";
import { orpc } from "../fetcher";

export const Homepage = () => {
  const session = authClient.useSession();

  const login = () => {
    authClient.signIn.social({
      provider: "spotify",
    });
  };

  const { data, error } = useQuery(orpc.album.getAlbums.queryOptions());

  return (
    <div className="grid place-items-center h-screen">
      <div>
        {data?.items?.map((album) => (
          <div>{album.album.name}</div>
        ))}
      </div>
      <div>
        {error && (
          <pre className="text-red-500">{JSON.stringify(error, null, 2)}</pre>
        )}
        <button type="button" onClick={login}>
          Log In
        </button>
        <button type="button" onClick={() => authClient.signOut()}>
          Log OUT
        </button>
      </div>
    </div>
  );
};
