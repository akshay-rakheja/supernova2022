import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";

// let authClient;

function App() {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [actor, setActor] = useState<Actor | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    (async () => {
      let authClient = await AuthClient.create();
      setAuthClient(authClient);
    })();
  }, []);

  // function get_registry() {
  //   return authClient?.registry;
  // }

  return (
    <div className="App ">
      {/* <div className="relative bg-white"> */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <button
                id="signinBtn"
                className="bg-red-500 border-red-900 hover:bg-red-900 rounded-md p-4 transition-all"
                onClick={async () => {
                  console.log("YOYOYOY");
                  if (authClient) {
                    authClient.login({
                      identityProvider: "https://identity.ic0.app",
                      onSuccess: async () => {
                        const principal = await authClient
                          .getIdentity()
                          .getPrincipal();
                        setPrincipal(principal);
                      },
                    });
                  }
                }}
              >
                Sign In
              </button>
            </div>
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

        <p> {principal?.toString()} </p>
      </div>
    </div>
  );
}

export default App;
