export const idlFactory = ({ IDL }) => {
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
    'getDisplayTime' : IDL.Func([], [IDL.Text], ['query']),
    'getNow' : IDL.Func([], [IDL.Nat], ['query']),
    'getNowSeconds' : IDL.Func([], [IDL.Nat32], ['query']),
    'get_account_id' : IDL.Func([], [IDL.Text], ['query']),
    'get_all' : IDL.Func([IDL.Principal], [IDL.Vec(UpdateInfo)], ['query']),
    'get_burned_pulses' : IDL.Func([], [IDL.Nat], ['query']),
    'get_count' : IDL.Func([IDL.Principal], [IDL.Nat32], ['query']),
    'get_message_count' : IDL.Func([IDL.Principal], [IDL.Nat32], ['query']),
    'get_messages' : IDL.Func([IDL.Principal], [IDL.Vec(Message)], ['query']),
    'get_next_update_time' : IDL.Func(
        [IDL.Principal, IDL.Nat32],
        [IDL.Nat],
        ['query'],
      ),
    'get_one' : IDL.Func([IDL.Principal, IDL.Nat32], [UpdateInfo], ['query']),
    'get_one_message' : IDL.Func(
        [IDL.Principal, IDL.Nat32],
        [Message],
        ['query'],
      ),
    'get_pulse_price' : IDL.Func([], [IDL.Nat], ['query']),
    'get_pulses' : IDL.Func([], [IDL.Nat], ['query']),
    'get_pulses_for' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'is_owner' : IDL.Func([], [IDL.Bool], ['query']),
    'mint_pulses' : IDL.Func(
        [IDL.Nat],
        [IDL.Record({ 'ok' : IDL.Opt(IDL.Nat), 'err' : IDL.Opt(IDL.Text) })],
        [],
      ),
    'mint_pulses_for' : IDL.Func([IDL.Nat, IDL.Principal], [IDL.Nat], []),
    'remove' : IDL.Func([IDL.Principal, IDL.Nat32], [], []),
    'remove_message' : IDL.Func([IDL.Principal, IDL.Nat32], [IDL.Nat32], []),
    'set_account_id' : IDL.Func([IDL.Text], [IDL.Text], []),
    'set_check_cost' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'set_owner' : IDL.Func([IDL.Principal], [IDL.Principal], []),
    'set_pulse_cost' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'set_pulse_price' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'transfer_pulses' : IDL.Func([IDL.Nat, IDL.Principal], [IDL.Nat], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
