import React, { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import Canister from "./Canister";
// import Canisters from "./Canisters";
// import Main from "./Main";

export const RouteManager: FC = () => {
  console.log("Navmaining");
  return (
    <Routes>
      {/* <Route path="/" element={<Main />} />
      <Route path="/canisters/" element={<Canisters />} />
      <Route path="/canisters/:id" element={<Canister />} /> */}
      {/* <Route path="*" element={<Navigate to="/canisters" replace />} /> */}
      {/* </Route> */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
};

export default RouteManager;
