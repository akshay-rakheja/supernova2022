import React, { FC, Fragment, useEffect, useState } from "react";
import PlugButton from "./PlugButton";
import background from "./assets/bg.png";
import { usePlug } from "./PlugProvider";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "./declarations/heartbeat/heartbeat.did";
import { idlFactory } from "./declarations/heartbeat";

const HEARTBEAT_CANISTER = "st75y-vaaaa-aaaaa-aaalq-cai";
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
            "flex flex-col justify-around transition-opacity opacity-0 duration-1000",
            plugNewClass,
          ].join(" ")}
        >
          <div className="flex justify-around w-full flex-row">
            <div className="flex">
              <PlugButton />
            </div>
          </div>
          <Stats />
        </div>
      </div>
    </Fragment>
  );
};

/* This example requires Tailwind CSS v2.0+ */

function Stats() {
  const { createActor } = usePlug();
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  useEffect(() => {
    (async () => {
      if (createActor) {
        const a = await createActor<_SERVICE>({
          canisterId: HEARTBEAT_CANISTER,
          interfaceFactory: idlFactory,
        });
        setActor(a);
      }
    })();
  }, [createActor]);
  const [heartbeats, setHeartbeats] = useState(BigInt(0));
  const [messages, setMessages] = useState(BigInt(0));
  const [burnedPulses, setBurnedPulses] = useState(BigInt(0));

  const stats = [
    { name: "Heartbeats", stat: heartbeats.toLocaleString() },
    { name: "Messages", stat: messages.toLocaleString() },
    {
      name: "Burned Pulses",
      stat: (Number(burnedPulses) / 10_000_000).toFixed(2),
    },
  ];
  return (
    <div>
      <h3 className="text-2xl leading-6 font-bold text-gray-900">Statistics</h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="px-4 py-5 bg-gradient-to-r from-yellow-600 to-blue-800 text-white shadow rounded-lg overflow-hidden sm:p-6 border-4 border-orange-500"
          >
            <dt className="text-sm font-medium text-gray-100 truncate">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-100">
              {item.stat}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default LoggedOut;
