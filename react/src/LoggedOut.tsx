import React, { FC } from "react";
import { useAuthentication } from "./AuthenticationProvider";

export const LoggedOut: FC = () => {
  const { login } = useAuthentication();
  console.log("Hellooo!!!!!");
  return (
    <div>
      <button
        id="signinBtn"
        className="bg-red-500 border-red-900 hover:bg-red-900 rounded-md p-4 transition-all"
        onClick={login}
      >
        Sign In
      </button>
    </div>
  );
};
export default LoggedOut;
