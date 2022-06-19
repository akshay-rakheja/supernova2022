import React from "react";
import LoggedOut from "./LoggedOut";
import { Helmet } from "react-helmet";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <title>Ticker Test for DeTi</title>
      </Helmet>
      <LoggedOut />
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
