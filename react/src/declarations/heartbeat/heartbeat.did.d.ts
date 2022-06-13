import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface AccountBalanceArgs { 'account' : Array<number> }
export interface Archive { 'canister_id' : Principal }
export interface Archives { 'archives' : Array<Archive> }
export interface Block {
  'transaction' : Transaction,
  'timestamp' : TimeStamp,
  'parent_hash' : [] | [Array<number>],
}
export interface BlockRange { 'blocks' : Array<Block> }
export interface DecimalsResult { 'decimals' : number }
export interface GetBlocksArgs { 'start' : bigint, 'length' : bigint }
export interface Message {
  'owner' : Principal,
  'args' : [] | [Array<number>],
  'func' : string,
  'time' : bigint,
  'canister' : Principal,
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
export interface Schedule {
  'dom' : [] | [number],
  'dow' : [] | [number],
  'month' : [] | [number],
  'hour' : number,
  'minute' : number,
}
export interface SymbolResult { 'symbol' : string }
export interface TimeStamp { 'timestamp_nanos' : bigint }
export interface Tokens { 'e8s' : bigint }
export interface Transaction {
  'memo' : bigint,
  'operation' : [] | [Operation],
  'created_at_time' : TimeStamp,
}
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
  'getDisplayTime' : ActorMethod<[], string>,
  'getNow' : ActorMethod<[], bigint>,
  'getNowSeconds' : ActorMethod<[], number>,
  'get_account_id' : ActorMethod<[], string>,
  'get_all' : ActorMethod<[Principal], Array<UpdateInfo>>,
  'get_burned_pulses' : ActorMethod<[], bigint>,
  'get_count' : ActorMethod<[Principal], number>,
  'get_message_count' : ActorMethod<[Principal], number>,
  'get_messages' : ActorMethod<[Principal], Array<Message>>,
  'get_next_update_time' : ActorMethod<[Principal, number], bigint>,
  'get_one' : ActorMethod<[Principal, number], UpdateInfo>,
  'get_one_message' : ActorMethod<[Principal, number], Message>,
  'get_pulse_price' : ActorMethod<[], bigint>,
  'get_pulses' : ActorMethod<[], bigint>,
  'get_pulses_for' : ActorMethod<[Principal], bigint>,
  'is_owner' : ActorMethod<[], boolean>,
  'mint_pulses' : ActorMethod<
    [bigint],
    { 'ok' : [] | [bigint], 'err' : [] | [string] },
  >,
  'mint_pulses_for' : ActorMethod<[bigint, Principal], bigint>,
  'remove' : ActorMethod<[Principal, number], undefined>,
  'remove_message' : ActorMethod<[Principal, number], number>,
  'set_account_id' : ActorMethod<[string], string>,
  'set_check_cost' : ActorMethod<[bigint], bigint>,
  'set_owner' : ActorMethod<[Principal], Principal>,
  'set_pulse_cost' : ActorMethod<[bigint], bigint>,
  'set_pulse_price' : ActorMethod<[bigint], bigint>,
  'transfer_pulses' : ActorMethod<[bigint, Principal], bigint>,
  'whoami' : ActorMethod<[], Principal>,
}
