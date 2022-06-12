import React, {
  useContext,
  createContext,
  useMemo,
  FC,
  useState,
  useEffect,
  useCallback,
  ReactChild,
  Component,
  ReactElement,
} from "react";

import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
const context = createContext({
  authenticated: false,
  principal: null as Principal | null,
  authClient: null as AuthClient | null,
  login: () => {},
  logout: () => {},
});

(async () => {
  // Canister Ids
  const nnsCanisterId = "qoctq-giaaa-aaaaa-aaaea-cai";

  // Whitelist
  const whitelist = [nnsCanisterId];

  // Host
  const host = "https://mainnet.dfinity.network";

  // Make the request
  try {
    const publicKey = await window.ic.plug.requestConnect({
      whitelist,
      host,
      timeout: 50000,
    });
    console.log(`The connected user's public key is:`, publicKey);
  } catch (e) {
    console.log(e);
  }
})();

const { Provider } = context;

export const AuthenticationProvider: FC<{
  LoggedOut?: ReactElement;
  children: ReactElement;
}> = ({ children, LoggedOut }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    (async () => {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      if (identity && identity.getPrincipal().toString() !== "2vxsx-fae") {
        setPrincipal(identity.getPrincipal());
        setAuthenticated(true);
      }
      setAuthClient(authClient);
    })();
  }, []);

  const login = useCallback(() => {
    if (authClient) {
      authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: async () => {
          const principal = await authClient.getIdentity().getPrincipal();
          setPrincipal(principal);
          setAuthenticated(true);
        },
      });
    }
  }, [authClient]);

  const logout = useCallback(() => {
    setPrincipal(null);
    setAuthenticated(false);
    authClient?.logout();
  }, [authClient]);

  const value = useMemo(() => {
    return {
      authenticated,
      authClient,
      login,
      logout,
      principal,
    };
  }, [authenticated, authClient, login, logout, principal]);
  if (!authenticated) {
    console.log("I iz not authenticatged");
    return <Provider value={value}>{LoggedOut ? LoggedOut : null}</Provider>;
  }
  return <Provider value={value}>{children}</Provider>;
};

export const useAuthentication = () => {
  const data = useContext(context);
  return data;
};
export default AuthenticationProvider;
