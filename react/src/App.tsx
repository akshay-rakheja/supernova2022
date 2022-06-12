import React, { useState, useEffect, FC } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import AuthenticationProvider from "./AuthenticationProvider";
import LoggedOut from "./LoggedOut";
import Main from "./Main";

function App() {
  return (
    <AuthenticationProvider LoggedOut={<LoggedOut />}>
      <Main />
    </AuthenticationProvider>
  );
}

export default App;
