import React, { FC, useState } from "react";
import { useAuthentication } from "./PlugProvider";

export const Main: FC = () => {
  const [balance, setBalance] = useState(0);
  const { principal, logout } = useAuthentication();
  return (
    <div className="App ">
      {/* <div className="relative bg-white"> */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1"></div>
          </div>
        </div>
      </header>
      {/* </div> */}
      {/* <header className="A"></header> */}
      <div className="grid grid-flow-col auto-cols-max auto-rows-max space-x-4 ...">
        <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
          <h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">
            Users
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">1</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
          <h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">
            Canisters
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">1</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
          <h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">
            Heartbeats
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">1</p>
        </div>
        <button onClick={logout} className="bg-red-500 p-md rounded-md">
          LOG ME OUT
        </button>

        <p> {principal?.toString()} </p>
        <p>My pulse balance {balance}</p>
        <button>Mint Pulses</button>
        <button>Schedule an event</button>
      </div>
    </div>
  );
};
export default Main;
