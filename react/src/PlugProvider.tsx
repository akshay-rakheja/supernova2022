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
import { HttpAgent } from "@dfinity/agent";

const {
  ic: { plug },
} = window as unknown as {
  ic: {
    plug: {
      requestConnect: (o: Record<string, any>) => Promise<any>;
      agent: HttpAgent;
    };
  };
};

const context = createContext({
  authenticated: false,
  principal: null as Principal | null,
  agent: plug.agent,
  login: () => {},
  logout: () => {},
});

const { Provider } = context;

export const PlugProvider: FC<{
  LoggedOut?: ReactElement;
  whitelist?: string[];
  host?: string;
  children: ReactElement;
  timeout?: number;
}> = ({
  children,
  LoggedOut,
  host = "https://mainnet.dfinity.network",
  whitelist = [],
  timeout = 120000,
}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);

  useEffect(() => {
    (async () => {
      // const identity = agent.getIdentity();
      // if (identity && identity.getPrincipal().toString() !== "2vxsx-fae") {
      //   setPrincipal(identity.getPrincipal());
      //   setAuthenticated(true);
      // }
    })();
  }, []);

  const login = useCallback(async () => {
    // Make the request
    try {
      const publicKey = await plug.requestConnect({
        whitelist,
        host,
        timeout,
      });
      if (publicKey) {
        const principal = await plug.agent.getPrincipal();
        setPrincipal(principal);
        setAuthenticated(true);
      }
    } catch (e) {
      console.log("Hi there", e);
    }
  }, [host, whitelist, timeout]);

  const logout = useCallback(() => {
    window.location.reload();
    // if (authenticated) {
    //   plug.agent.invalidateIdentity();
    //   setPrincipal(null);
    //   setAuthenticated(false);
    // }
  }, []);

  const value = useMemo(() => {
    return {
      authenticated,
      agent: plug.agent,
      login,
      logout,
      principal,
    };
  }, [authenticated, plug.agent, login, logout, principal]);
  if (!authenticated) {
    return <Provider value={value}>{LoggedOut ? LoggedOut : null}</Provider>;
  }
  return <Provider value={value}>{children}</Provider>;
};

export const useAuthentication = () => {
  const data = useContext(context);
  return data;
};
export default PlugProvider;
