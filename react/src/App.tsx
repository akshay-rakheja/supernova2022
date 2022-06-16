import React, { Fragment } from "react";
// import "./App.css";
import LoggedOut from "./LoggedOut";
import PlugProvider, { Authenticated, Unauthenticated } from "./PlugProvider";
import config from "./config.json";
import { Helmet } from "react-helmet";
import NavigationMain from "./NavigationMain";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
const whitelist = Object.values(config.canisters);

const history = createBrowserHistory({ window });
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
    </BrowserRouter>
  );
}

export default App;
