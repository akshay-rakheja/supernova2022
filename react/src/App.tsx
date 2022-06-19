import React, { Fragment } from "react";
import LoggedOut from "./LoggedOut";
import { PlugProvider, Authenticated, Unauthenticated } from "@raydeck/useplug";
import config from "./config.json";
import { Helmet } from "react-helmet";
import NavigationMain from "./NavigationMain";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const whitelist = [
  config[config.mode as "production" | "local"].canisters.heartbeat,
];

function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <title>DeTi: Decentralized Time</title>
      </Helmet>
      <PlugProvider whitelist={whitelist}>
        <Fragment>
          <Authenticated>
            <NavigationMain />
          </Authenticated>
          <Unauthenticated>
            <LoggedOut />
          </Unauthenticated>
        </Fragment>
      </PlugProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        toastClassName={(context) => {
          return "bg-black text-white bg-opacity-40 p-2 rounded-lg";
        }}
      />
    </BrowserRouter>
  );
}

export default App;
