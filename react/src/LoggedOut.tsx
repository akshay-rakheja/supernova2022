import React, { FC, Fragment, useEffect, useState } from "react";
import PlugButton from "./PlugButton";
import background from "./assets/bg.png";
export const LoggedOut: FC = () => {
  const [newClass, setNewClass] = useState("");
  const [plugNewClass, setPlugNewClass] = useState("");
  useEffect(() => {
    setTimeout(() => {
      setNewClass("blur");
      setPlugNewClass("opacity-100");
    }, 2000);
  }, []);
  return (
    <Fragment>
      <div
        className={[
          "h-screen w-screen absolute  bg-cover transition duration-1000 ",
          newClass,
        ].join(" ")}
        style={{ backgroundImage: `url(${background})` }}
        onClick={() => {
          setNewClass("backdrop-blur");
          setPlugNewClass("opacity-100");
        }}
      ></div>
      <div
        className={[
          "h-screen w-screen absolute flex justify-around content-around transition duration-1000 ",
        ].join(" ")}
      >
        <div
          className={[
            "flex flex-col justify-around transition opacity-0 duration-500",
            plugNewClass,
          ].join(" ")}
        >
          <PlugButton />
        </div>
      </div>
    </Fragment>
  );
};
export default LoggedOut;
