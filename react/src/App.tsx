import React, { useState, useEffect, FC } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import AuthenticationProvider from "./AuthClientProvider";
import LoggedOut from "./LoggedOut";
import Main from "./Main";
import PlugProvider from "./PlugProvider";

function App() {
  return (
    <PlugProvider LoggedOut={<LoggedOut />}>
      <Main />
    </PlugProvider>
  );
}

export default App;
