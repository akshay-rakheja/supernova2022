import React, { Fragment } from "react";
import "./App.css";
import LoggedOut from "./LoggedOut";
import Main from "./Main";
import PlugProvider, {
  PlugAuthenticated,
  PlugUnauthenticated,
} from "./PlugProvider";
import config from "./config.json";
import { Helmet } from "react-helmet";
const whitelist = Object.values(config.canisters);

function App() {
  return (
    <Fragment>
      <Helmet>
        <title>DeTi: Decentralized Time</title>
      </Helmet>
      <PlugProvider whitelist={whitelist}>
        <Fragment>
          <PlugAuthenticated>
            <Main />
          </PlugAuthenticated>
          <PlugUnauthenticated>
            <LoggedOut />
          </PlugUnauthenticated>
        </Fragment>
      </PlugProvider>
    </Fragment>
  );
}

export default App;
