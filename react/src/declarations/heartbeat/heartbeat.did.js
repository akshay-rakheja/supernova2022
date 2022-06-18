export const idlFactory = ({ IDL }) => {
  const TxReceipt = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'InsufficientAllowance' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'ErrorOperationStyle' : IDL.Null,
      'Unauthorized' : IDL.Null,
      'LedgerTrap' : IDL.Null,
      'ErrorTo' : IDL.Null,
      'Other' : IDL.Text,
      'BlockUsed' : IDL.Null,
      'AmountTooSmall' : IDL.Null,
    }),
  });
  const Metadata = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'owner' : IDL.Principal,
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Operation = IDL.Variant({
    'Burn' : IDL.Record({ 'from' : IDL.Vec(IDL.Nat8), 'amount' : Tokens }),
    'Mint' : IDL.Record({ 'to' : IDL.Vec(IDL.Nat8), 'amount' : Tokens }),
    'Transfer' : IDL.Record({
      'to' : IDL.Vec(IDL.Nat8),
      'fee' : Tokens,
      'from' : IDL.Vec(IDL.Nat8),
      'amount' : Tokens,
    }),
  });
  const TransactionStatus = IDL.Variant({
    'failed' : IDL.Null,
    'succeeded' : IDL.Null,
  });
  const TxRecord = IDL.Record({
    'op' : Operation,
    'to' : IDL.Principal,
    'fee' : IDL.Nat,
    'status' : TransactionStatus,
    'from' : IDL.Principal,
    'timestamp' : IDL.Nat,
    'caller' : IDL.Principal,
    'index' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const Schedule = IDL.Record({
    'dom' : IDL.Opt(IDL.Nat8),
    'dow' : IDL.Opt(IDL.Nat8),
    'month' : IDL.Opt(IDL.Nat8),
    'hour' : IDL.Nat8,
    'minute' : IDL.Nat8,
  });
  const UpdateInfo = IDL.Record({
    'owner' : IDL.Principal,
    'period' : IDL.Opt(IDL.Nat),
    'args' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'func' : IDL.Text,
    'canister' : IDL.Principal,
    'schedule' : IDL.Opt(Schedule),
  });
  const Message = IDL.Record({
    'owner' : IDL.Principal,
    'args' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'func' : IDL.Text,
    'time' : IDL.Nat,
    'canister' : IDL.Principal,
  });
  return IDL.Service({
    'add_daily_schedule' : IDL.Func(
        [IDL.Principal, IDL.Nat8, IDL.Nat8, IDL.Text],
        [IDL.Nat32],
        [],
      ),
    'add_message' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Text, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [IDL.Nat32],
        [],
      ),
    'add_monthly_schedule' : IDL.Func(
        [IDL.Principal, IDL.Nat8, IDL.Nat8, IDL.Nat8, IDL.Text],
        [IDL.Nat32],
        [],
      ),
    'add_period' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Text],
        [IDL.Nat32],
        [],
      ),
    'add_weekly_schedule' : IDL.Func(
        [IDL.Principal, IDL.Nat8, IDL.Nat8, IDL.Nat8, IDL.Text],
        [IDL.Nat32],
        [],
      ),
    'add_yearly_schedule' : IDL.Func(
        [IDL.Principal, IDL.Nat8, IDL.Nat8, IDL.Nat8, IDL.Nat8, IDL.Text],
        [IDL.Nat32],
        [],
      ),
    'allowance' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Nat],
        ['query'],
      ),
    'approve' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'burn' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'getDisplayTime' : IDL.Func([], [IDL.Text], ['query']),
    'getMetadata' : IDL.Func([], [Metadata], ['query']),
    'getNow' : IDL.Func([], [IDL.Nat], ['query']),
    'getNowSeconds' : IDL.Func([], [IDL.Nat32], ['query']),
    'getTransaction' : IDL.Func([IDL.Nat], [TxRecord], ['query']),
    'getTransactions' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(TxRecord)],
        ['query'],
      ),
    'getUserTransactionAmount' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat],
        ['query'],
      ),
    'getUserTransactions' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Vec(TxRecord)],
        ['query'],
      ),
    'get_account_id' : IDL.Func([], [IDL.Text], ['query']),
    'get_all' : IDL.Func([], [IDL.Vec(UpdateInfo)], ['query']),
    'get_burned_pulses' : IDL.Func([], [IDL.Nat], ['query']),
    'get_count' : IDL.Func([], [IDL.Nat32], ['query']),
    'get_message_count' : IDL.Func([], [IDL.Nat32], ['query']),
    'get_messages' : IDL.Func([], [IDL.Vec(Message)], ['query']),
    'get_next_update_time' : IDL.Func([IDL.Nat32], [IDL.Nat], ['query']),
    'get_one' : IDL.Func([IDL.Nat32], [UpdateInfo], ['query']),
    'get_one_message' : IDL.Func([IDL.Nat32], [Message], ['query']),
    'get_pulse_price' : IDL.Func([], [IDL.Nat], ['query']),
    'get_total_burned_pulses' : IDL.Func([], [IDL.Nat], ['query']),
    'get_total_heartbeats' : IDL.Func([], [IDL.Nat], ['query']),
    'get_total_messages' : IDL.Func([], [IDL.Nat], ['query']),
    'get_total_pulses' : IDL.Func([], [IDL.Nat], ['query']),
    'historySize' : IDL.Func([], [IDL.Nat], ['query']),
    'is_owner' : IDL.Func([], [IDL.Bool], ['query']),
    'logo' : IDL.Func([], [IDL.Text], ['query']),
    'mint' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'mint_pulses' : IDL.Func(
        [IDL.Nat],
        [IDL.Record({ 'ok' : IDL.Opt(IDL.Nat), 'err' : IDL.Opt(IDL.Text) })],
        [],
      ),
    'mint_pulses_for' : IDL.Func([IDL.Nat, IDL.Principal], [IDL.Nat], []),
    'myBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'name' : IDL.Func([], [IDL.Text], ['query']),
    'remove' : IDL.Func([IDL.Nat32], [], []),
    'remove_message' : IDL.Func([IDL.Nat32], [IDL.Nat32], []),
    'setFee' : IDL.Func([IDL.Nat], [], []),
    'setFeeTo' : IDL.Func([IDL.Principal], [], []),
    'setLogo' : IDL.Func([IDL.Text], [], []),
    'setName' : IDL.Func([IDL.Text], [], []),
    'setOwner' : IDL.Func([IDL.Principal], [], []),
    'set_account_id' : IDL.Func([IDL.Text], [IDL.Text], []),
    'set_check_cost' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'set_owner' : IDL.Func([IDL.Principal], [IDL.Principal], []),
    'set_pulse_cost' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'set_pulse_price' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'symbol' : IDL.Func([], [IDL.Text], ['query']),
    'totalSupply' : IDL.Func([], [IDL.Nat], ['query']),
    'transfer' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'transferFrom' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [TxReceipt],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
