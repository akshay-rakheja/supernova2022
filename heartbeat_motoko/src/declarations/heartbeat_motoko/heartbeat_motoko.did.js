export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'ring' : IDL.Func([], [], []) });
};
export const init = ({ IDL }) => { return []; };
