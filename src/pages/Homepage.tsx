import { authClient } from "../auth-client";

export const Homepage = () => {
  const session = authClient.useSession();

  const login = () => {
    authClient.signIn.social({
      provider: "spotify",
    });
  };

  return (
    <div className="grid place-items-center h-screen">
      <div>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <button onClick={login}>Log In</button>
      </div>
    </div>
  );
};
