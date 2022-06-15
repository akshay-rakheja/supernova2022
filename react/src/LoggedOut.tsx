import React, { FC, Fragment, useCallback, useEffect, useState } from "react";
import PlugButton from "./PlugButton";
import background from "./assets/bg.png";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "./declarations/heartbeat/heartbeat.did";
import { createActor } from "./declarations/heartbeat";
import config from "./config.json";
const {
  canisters: { heartbeat },
} = config;
export const LoggedOut: FC = () => {
  const [newClass, setNewClass] = useState("");
  const [plugNewClass, setPlugNewClass] = useState("opacity-0");
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  useEffect(() => {
    (async () => {
      const a = await createActor(heartbeat);
      setActor(a);
    })();
  }, []);
  const getStats = useCallback(async () => {
    if (actor) {
      setHeartbeats(await actor.get_total_heartbeats());
      setMessages(await actor.get_total_messages());
      setBurnedPulses(await actor.get_total_burned_pulses());
    }
  }, [actor]);
  const [timer, setTimer] = useState<NodeJS.Timer>();
  useEffect(() => {
    if (actor) {
      let timer: NodeJS.Timer;
      setTimer((oldTimer) => {
        if (oldTimer) clearInterval(oldTimer);
        timer = setInterval(getStats, 5000);
        return timer;
      });
    }
    return () => {
      clearInterval(timer);
    };
  }, [getStats]);
  const [heartbeats, setHeartbeats] = useState(BigInt(0));
  const [messages, setMessages] = useState(BigInt(0));
  const [burnedPulses, setBurnedPulses] = useState(BigInt(0));
  useEffect(() => {
    setTimeout(() => {
      setNewClass("blur");
      setPlugNewClass("opacity-100");
    }, 2000);
  }, []);
  useEffect(() => {
    setNewClass("");
    setTimeout(() => {
      setNewClass("blur");
    }, 500);
  }, [heartbeats]);
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
            "flex flex-col justify-between transition-opacity  duration-1000",
            plugNewClass,
          ].join(" ")}
        >
          <div></div>
          <div className="flex justify-around w-full flex-row">
            <div className="flex">
              <PlugButton />
            </div>
          </div>
          <Stats
            heartbeats={heartbeats}
            messages={messages}
            burnedPulses={burnedPulses}
          />
        </div>
      </div>
    </Fragment>
  );
};

/* This example requires Tailwind CSS v2.0+ */

const Stats: FC<{
  heartbeats: bigint;
  burnedPulses: bigint;
  messages: bigint;
}> = ({ heartbeats, burnedPulses, messages }) => {
  // const { createActor } = usePlug();

  const stats = [
    { name: "Heartbeats", stat: heartbeats.toLocaleString() },
    { name: "Messages", stat: messages.toLocaleString() },
    {
      name: "Burned Pulses",
      stat: (Number(burnedPulses) / 10_000_000).toFixed(2),
    },
  ];
  return (
    <div className="">
      <div className="p-6 bg-gray-800 opacity-80 rounded-lg mb-6">
        <h2 className="text-3xl leading-6 font-bold text-gray-100 text-center">
          Statistics
        </h2>
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
    </div>
  );
};

export default LoggedOut;
