import React, { Fragment } from "react";
// import "./App.css";
// import LoggedOut from "./LoggedOut";
// import PlugProvider, { Authenticated, Unauthenticated } from "./PlugProvider";
// import config from "./config.json";
// import { Helmet } from "react-helmet";
// import NavigationMain from "./NavigationMain";
import {
  BrowserRouter,
  Route,
  Routes,
  // unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import { createBrowserHistory } from "history";
// const whitelist = Object.values(config.canisters);

const history = createBrowserHistory({ window });
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Hello</div>} />
        <Route path="/2" element={<div>Hello2</div>} />
      </Routes>
    </BrowserRouter>
  );
  // return (
  //   <Fragment>
  //     <Helmet>
  //       <title>DeTi: Decentralized Time</title>
  //     </Helmet>
  //     <PlugProvider whitelist={whitelist}>
  //       <Fragment>
  //         <Authenticated>
  //           <BrowserRouter>
  //             <NavigationMain />
  //           </BrowserRouter>
  //         </Authenticated>
  //         <Unauthenticated>
  //           <LoggedOut />
  //         </Unauthenticated>
  //       </Fragment>
  //     </PlugProvider>
  //   </Fragment>
  // );
}

export default App;
