export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'count' : IDL.Func([], [IDL.Int], ['query']),
    'count_counter2' : IDL.Func([], [IDL.Int], ['query']),
    'count_counter3' : IDL.Func([], [IDL.Int], ['query']),
    'counter2_tick' : IDL.Func([], [IDL.Int], []),
    'counter3_tick' : IDL.Func([], [IDL.Int], []),
    'tick2' : IDL.Func([], [IDL.Int], []),
  });
};
export const init = ({ IDL }) => { return []; };
