import type { ReactNode } from "react";
import { authClient } from "../auth-client";

export const RequireAuthLayout = ({ children }: { children: ReactNode }) => {
  const session = authClient.useSession();
  const login = () => {
    authClient.signIn.social({
      provider: "spotify",
    });
  };
  if (session.isPending) {
    return <div></div>;
  }
  if (!session) {
    return (
      <div>
        <button type="button" onClick={login}>
          Log In
        </button>
      </div>
    );
  } else {
    return children;
  }
};
