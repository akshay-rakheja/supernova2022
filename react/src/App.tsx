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

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button
          id="signinBtn"
          className="bg-red-500 border-red-900 hover:bg-red-900 rounded-md p-10 transition-all"
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
        <p> {principal?.toString()} </p>
      </header>
    </div>
  );
}

export default App;
