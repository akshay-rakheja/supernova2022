import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface AccountBalanceArgs { 'account' : Array<number> }
export interface AllowedPulsesListItem { 'key' : string, 'value' : bigint }
export interface Archive { 'canister_id' : Principal }
export interface Archives { 'archives' : Array<Archive> }
export interface Block {
  'transaction' : Transaction,
  'timestamp' : TimeStamp,
  'parent_hash' : [] | [Array<number>],
}
export interface BlockRange { 'blocks' : Array<Block> }
export interface BurnedPulsesListItem { 'key' : string, 'value' : bigint }
export interface DecimalsResult { 'decimals' : number }
export interface GetBlocksArgs { 'start' : bigint, 'length' : bigint }
export interface LastUpdatedListItem { 'key' : string, 'value' : Array<bigint> }
export interface Message {
  'owner' : Principal,
  'args' : [] | [Array<number>],
  'func' : string,
  'time' : bigint,
  'canister' : Principal,
}
export interface MessageRegistryListItem {
  'key' : string,
  'value' : Array<Message>,
}
export interface Metadata {
  'fee' : bigint,
  'decimals' : number,
  'owner' : Principal,
  'logo' : string,
  'name' : string,
  'totalSupply' : bigint,
  'symbol' : string,
}
export interface NameResult { 'name' : string }
export type Operation = {
    'Burn' : { 'from' : Array<number>, 'amount' : Tokens }
  } |
  { 'Mint' : { 'to' : Array<number>, 'amount' : Tokens } } |
  {
    'Transfer' : {
      'to' : Array<number>,
      'fee' : Tokens,
      'from' : Array<number>,
      'amount' : Tokens,
    }
  };
export interface PulseLedgerListItem { 'key' : string, 'value' : bigint }
export type QueryArchiveError = {
    'BadFirstBlockIndex' : {
      'requested_index' : bigint,
      'first_valid_index' : bigint,
    }
  } |
  { 'Other' : { 'error_message' : string, 'error_code' : bigint } };
export type QueryArchiveFn = ActorMethod<[GetBlocksArgs], QueryArchiveResult>;
export type QueryArchiveResult = { 'Ok' : BlockRange } |
  { 'Err' : QueryArchiveError };
export interface QueryBlocksResponse {
  'certificate' : [] | [Array<number>],
  'blocks' : Array<Block>,
  'chain_length' : bigint,
  'first_block_index' : bigint,
  'archived_blocks' : Array<
    { 'callback' : QueryArchiveFn, 'start' : bigint, 'length' : bigint }
  >,
}
export interface RegistryListItem {
  'key' : string,
  'value' : Array<UpdateInfo>,
}
export interface Schedule {
  'dom' : [] | [number],
  'dow' : [] | [number],
  'month' : [] | [number],
  'hour' : number,
  'minute' : number,
}
export interface StableLists {
  'burnedPulsesList' : Array<BurnedPulsesListItem>,
  'pulseLedgerList' : Array<PulseLedgerListItem>,
  'allowedPulsesList' : Array<AllowedPulsesListItem>,
  'lastUpdatedList' : Array<LastUpdatedListItem>,
  'messageRegistryList' : Array<MessageRegistryListItem>,
  'registryList' : Array<RegistryListItem>,
}
export interface SymbolResult { 'symbol' : string }
export interface TimeStamp { 'timestamp_nanos' : bigint }
export interface Tokens { 'e8s' : bigint }
export interface Transaction {
  'memo' : bigint,
  'operation' : [] | [Operation],
  'created_at_time' : TimeStamp,
}
export type TransactionStatus = { 'failed' : null } |
  { 'succeeded' : null };
export interface TransferArgs {
  'to' : Array<number>,
  'fee' : Tokens,
  'memo' : bigint,
  'from_subaccount' : [] | [Array<number>],
  'created_at_time' : [] | [TimeStamp],
  'amount' : Tokens,
}
export type TransferError = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'TxDuplicate' : { 'duplicate_of' : bigint } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
export interface TransferFee { 'transfer_fee' : Tokens }
export type TransferFeeArg = {};
export type TransferResult = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export type TxReceipt = { 'Ok' : bigint } |
  {
    'Err' : { 'InsufficientAllowance' : null } |
      { 'InsufficientBalance' : null } |
      { 'ErrorOperationStyle' : null } |
      { 'Unauthorized' : null } |
      { 'LedgerTrap' : null } |
      { 'ErrorTo' : null } |
      { 'Other' : string } |
      { 'BlockUsed' : null } |
      { 'AmountTooSmall' : null }
  };
export interface TxRecord {
  'op' : Operation,
  'to' : Principal,
  'fee' : bigint,
  'status' : TransactionStatus,
  'from' : Principal,
  'timestamp' : bigint,
  'caller' : Principal,
  'index' : bigint,
  'amount' : bigint,
}
export interface UpdateInfo {
  'owner' : Principal,
  'period' : [] | [bigint],
  'args' : [] | [Array<number>],
  'func' : string,
  'canister' : Principal,
  'schedule' : [] | [Schedule],
}
export interface _SERVICE {
  'add_daily_schedule' : ActorMethod<
    [Principal, number, number, string],
    number,
  >,
  'add_message' : ActorMethod<
    [Principal, bigint, string, [] | [Array<number>]],
    number,
  >,
  'add_monthly_schedule' : ActorMethod<
    [Principal, number, number, number, string],
    number,
  >,
  'add_period' : ActorMethod<[Principal, bigint, string], number>,
  'add_weekly_schedule' : ActorMethod<
    [Principal, number, number, number, string],
    number,
  >,
  'add_yearly_schedule' : ActorMethod<
    [Principal, number, number, number, number, string],
    number,
  >,
  'allowance' : ActorMethod<[Principal, Principal], bigint>,
  'approve' : ActorMethod<[Principal, bigint], TxReceipt>,
  'balanceOf' : ActorMethod<[Principal], bigint>,
  'burn' : ActorMethod<[Principal, bigint], TxReceipt>,
  'decimals' : ActorMethod<[], number>,
  'getDisplayTime' : ActorMethod<[], string>,
  'getMetadata' : ActorMethod<[], Metadata>,
  'getNow' : ActorMethod<[], bigint>,
  'getNowSeconds' : ActorMethod<[], number>,
  'getTransaction' : ActorMethod<[bigint], TxRecord>,
  'getTransactions' : ActorMethod<[bigint, bigint], Array<TxRecord>>,
  'getUserTransactionAmount' : ActorMethod<[Principal], bigint>,
  'getUserTransactions' : ActorMethod<
    [Principal, bigint, bigint],
    Array<TxRecord>,
  >,
  'get_account_id' : ActorMethod<[], string>,
  'get_all' : ActorMethod<[], Array<UpdateInfo>>,
  'get_burned_pulses' : ActorMethod<[], bigint>,
  'get_count' : ActorMethod<[], number>,
  'get_message_count' : ActorMethod<[], number>,
  'get_messages' : ActorMethod<[], Array<Message>>,
  'get_next_update_time' : ActorMethod<[number], bigint>,
  'get_one' : ActorMethod<[number], UpdateInfo>,
  'get_one_message' : ActorMethod<[number], Message>,
  'get_pulse_price' : ActorMethod<[], bigint>,
  'get_total_burned_pulses' : ActorMethod<[], bigint>,
  'get_total_heartbeats' : ActorMethod<[], bigint>,
  'get_total_messages' : ActorMethod<[], bigint>,
  'get_total_pulses' : ActorMethod<[], bigint>,
  'historySize' : ActorMethod<[], bigint>,
  'is_owner' : ActorMethod<[], boolean>,
  'logo' : ActorMethod<[], string>,
  'mint' : ActorMethod<[Principal, bigint], TxReceipt>,
  'mint_pulses' : ActorMethod<
    [bigint],
    { 'ok' : [] | [bigint], 'err' : [] | [string] },
  >,
  'mint_pulses_for' : ActorMethod<[bigint, Principal], bigint>,
  'myBalance' : ActorMethod<[], bigint>,
  'name' : ActorMethod<[], string>,
  'remove' : ActorMethod<[number], undefined>,
  'remove_message' : ActorMethod<[number], number>,
  'setFee' : ActorMethod<[bigint], undefined>,
  'setFeeTo' : ActorMethod<[Principal], undefined>,
  'setLogo' : ActorMethod<[string], undefined>,
  'setName' : ActorMethod<[string], undefined>,
  'setOwner' : ActorMethod<[Principal], undefined>,
  'set_account_id' : ActorMethod<[string], string>,
  'set_check_cost' : ActorMethod<[bigint], bigint>,
  'set_owner' : ActorMethod<[Principal], Principal>,
  'set_pulse_cost' : ActorMethod<[bigint], bigint>,
  'set_pulse_price' : ActorMethod<[bigint], bigint>,
  'symbol' : ActorMethod<[], string>,
  'totalSupply' : ActorMethod<[], bigint>,
  'transfer' : ActorMethod<[Principal, bigint], TxReceipt>,
  'transferFrom' : ActorMethod<[Principal, Principal, bigint], TxReceipt>,
  'whoami' : ActorMethod<[], Principal>,
}
