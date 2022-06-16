import {
  useContext,
  createContext,
  useMemo,
  FC,
  useState,
  useCallback,
  ReactElement,
  ReactNode,
  Fragment,
} from "react";
import { Principal } from "@dfinity/principal";
import { ActorMethod, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import { useActor } from "./useActor";
export { useActor };
console.log("Hello there");
//#region Plug Type
type RequestConnectParams = {
  whitelist?: string[];
  host?: string;
  timeout?: number;
};
type PublicKey = any;
type CreateActorParams = {
  canisterId: string;
  interfaceFactory: InterfaceFactory;
};
type Balance = {
  amount: number;
  currency: string;
  image: string;
  name: string;
  value: number;
};
type RequestTransferParams = {
  to: String;
  amount: number;
  opts?: {
    fee?: number;
    memo?: string;
    from_subaccount?: Number;
    created_at_time?: {
      timestamp_nanos: number;
    };
  };
};
type RequestTransferResponse = { height: number };
type Cycles = number;
type CanisterId = string;
type RequestBurnXTCParams = { amount: Cycles; to: CanisterId };
type Transaction = {
  idl: any; //@TODO RHD To set this to the right type
  canisterId: Principal;
  methodName: string;
  args: Record<string, any>[];
  onFail: (res: string) => void;
  onSuccess: (res: string) => void;
};

type BatchTransactionResponse = {};
type Plug = {
  requestConnect: (o?: RequestConnectParams) => Promise<PublicKey>;
  agent: HttpAgent;
  isConnected: () => boolean;
  createActor: <T = Record<string, ActorMethod>>(
    params: CreateActorParams
  ) => Promise<ActorSubclass<T>>;
  // createActor: (
  //   interfaceFactory: IDL.InterfaceFactory,
  //   configuration: ActorConfig
  // ) =>;

  requestBalance: () => Promise<Balance[]>;
  requestTransfer: (
    params: RequestTransferParams
  ) => Promise<RequestTransferResponse>;
  requestBurnXTC: (
    params: RequestBurnXTCParams
  ) => Promise<RequestTransferResponse>;
  batchTransactions: (
    transactions: Transaction[]
  ) => Promise<BatchTransactionResponse>;
};
const { ic } = window as unknown as {
  ic?: {
    plug?: Plug;
  };
};
export const plug = ic?.plug;
//#endregion

//#region Context Provider
const context = createContext({
  authenticated: false,
  principal: null as Principal | null,
  agent: plug?.agent,
  login: () => {},
  logout: () => {},
  createActor: plug?.createActor,
  requestBalance: plug?.requestBalance,
  requestTransfer: plug?.requestTransfer,
  batchTransactions: plug?.batchTransactions,
  plug,
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
  console.log("I am authenticated maybe", authenticated);
  const [principal, setPrincipal] = useState<Principal | null>(null);

  const login = useCallback(async () => {
    try {
      if (plug) {
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
      }
    } catch (e) {
      console.log("Hi there", e);
    }
  }, [host, whitelist, timeout]);

  const logout = useCallback(() => {
    console.log("I ran logout");
    window.location.reload();
  }, []);

  const value = useMemo(() => {
    return {
      authenticated,
      agent: plug?.agent,
      login,
      logout,
      principal,
      createActor: ((o: CreateActorParams) =>
        plug?.createActor(o)) as Plug["createActor"],
      requestBalance: plug?.requestBalance,
      requestTransfer: plug?.requestTransfer,
      batchTransactions: plug?.batchTransactions,
      plug,
    };
  }, [authenticated, plug, login, logout, principal]);
  if (!authenticated && LoggedOut) {
    return <Provider value={value}>{LoggedOut ? LoggedOut : null}</Provider>;
  }
  return <Provider value={value}>{children}</Provider>;
};

export const usePlug = () => {
  const data = useContext(context);
  return data;
};
//#endregion

export const Authenticated: FC<{ children: ReactNode }> = ({ children }) => {
  const { authenticated } = usePlug();
  if (!authenticated) return null;
  else return <Fragment>{children}</Fragment>;
};

export const Unauthenticated: FC<{ children: ReactNode }> = ({ children }) => {
  const { authenticated } = usePlug();
  if (authenticated) return null;
  else return <Fragment>{children}</Fragment>;
};

export default PlugProvider;
