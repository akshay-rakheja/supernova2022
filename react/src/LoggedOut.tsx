import React, { FC, Fragment } from "react";
import PlugButton from "./PlugButton";
import background from "./assets/bg.png";
export const LoggedOut: FC = () => {
  return (
    <Fragment>
      <div
        className="h-screen w-screen absolute  bg-cover "
        style={{ backgroundImage: `url(${background})` }}
      ></div>
      <div
        className={
          "h-screen w-screen absolute flex justify-around content-around transition backdrop-blur"
        }
      >
        <div className="flex flex-col justify-around">
          <PlugButton />
        </div>
      </div>
    </Fragment>
  );
};
export default LoggedOut;
