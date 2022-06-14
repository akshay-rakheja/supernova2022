export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'count' : IDL.Func([], [IDL.Int], ['query']),
    'tick2' : IDL.Func([], [IDL.Int], []),
  });
};
export const init = ({ IDL }) => { return []; };
