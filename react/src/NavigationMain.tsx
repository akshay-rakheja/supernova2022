import React, { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Canister from "./Canister";
import Schedules from "./Schedules";
import Main from "./Main";
import Pulses from "./Pulses";
import Messages from "./Messages";

export const RouteManager: FC = () => {
  console.log("Navmaining");
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route path="schedules" element={<Schedules />} />
        <Route path="messages" element={<Messages />} />
        <Route path="pulses" element={<Pulses />} />
        <Route path="/" element={<Navigate to="/schedules" replace />} />
        <Route path="*" element={<Navigate to="/schedules" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/canisters" replace />} />
    </Routes>
  );
};

export default RouteManager;
