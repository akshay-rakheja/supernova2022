import { nat, nat8, Opt, Principal, Variant } from "azle";

type Metadata = {
  logo: Text; // base64 encoded logo or logo url
  name: Text; // token name
  symbol: Text; // token symbol
  decimals: nat8; // token decimal
  totalSupply: nat; // token total supply
  owner: Principal; // token owner
  fee: nat; // fee for update calls
};

type TxReceipt = Variant<{
  Ok: nat;
  Err: Variant<{
    InsufficientAllowance: null;
    InsufficientBalance: null;
    ErrorOperationStyle: null;
    Unauthorized: null;
    LedgerTrap: null;
    ErrorTo: null;
    Other: string;
    BlockUsed: null;
    AmountTooSmall: null;
  }>;
}>;

type Operation = Variant<{
  approve: null;
  mint: null;
  transfer: null;
  transferFrom: null;
}>;
type TransactionStatus = Variant<{
  succeeded: null;
  failed: null;
}>;
type TxRecord = {
  caller: Opt<Principal>;
  op: Operation; // operation type
  index: nat; // transaction index
  from: Principal;
  to: Principal;
  amount: nat;
  fee: nat;
  timestamp: nat;
  status: TransactionStatus;
};

function transfer(to: Principal, value: nat): UpdateAsync<TxReceipt> {}
