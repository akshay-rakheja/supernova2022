import React, { FC, Fragment, useCallback, useEffect, useState } from "react";
import { PlugButton } from "@raydeck/useplug";
import background from "./assets/bg.png";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "./declarations/heartbeat/heartbeat.did";
import { createActor } from "./declarations/heartbeat";
import { FaGithub } from "react-icons/fa";
import config from "./config.json";
import { ArrowUpIcon } from "@heroicons/react/outline";
const {
  host,
  canisters: { heartbeat },
} = config[config.mode as "production" | "local"];

const useHeartbeat = () => {
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  useEffect(() => {
    (async () => {
      const a = await createActor(heartbeat, {
        agentOptions: { host },
      });
      setActor(a);
    })();
  }, []);
  return actor;
};
let timer: NodeJS.Timer;
export const LoggedOut: FC = () => {
  const [newClass, setNewClass] = useState("");
  const [plugNewClass, setPlugNewClass] = useState("opacity-0");
  const [iconNewClass, setIconNewClass] = useState("text-black");
  const actor = useHeartbeat();
  const getStats = useCallback(async () => {
    if (actor) {
      console.log("Firing getstats");
      setHeartbeats(await actor.get_total_heartbeats());
      setMessages(await actor.get_total_messages());
      setBurnedPulses(await actor.get_total_burned_pulses());
    }
  }, [actor]);
  useEffect(() => {
    if (actor) {
      clearInterval(timer);
      timer = setInterval(getStats, 5000);
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
      // setNewClass("blur-xl");
      setPlugNewClass("opacity-100");
    }, 2000);
  }, []);
  useEffect(() => {
    if (heartbeats) {
      setNewClass("blur-xl");
      setIconNewClass("text-white mt-4");

      setTimeout(() => {
        setNewClass("blur-sm");
        setIconNewClass("text-black");
      }, 1500);
    }
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
          <div className="bg-black bg-opacity-50 flex flex-row w-screen justify-between p-4">
            <a
              href="https://github.com/akshay-rakheja/supernova2022"
              className="text-gray-200 hover:text-gray-700 transition duration-250"
            >
              <div className="flex flex-row ">
                <FaGithub size={20} />
                <span className="ml-2 font-medium">Fork us on GitHub</span>
              </div>
            </a>
            <div className=" font-bold text-white opacity-50">
              Or Just Enjoy the Pulses As They Go Out Every 10s
            </div>
          </div>
          <div>
            <div className="flex justify-around w-full flex-row">
              <div className="flex">
                <PlugButton dark />
              </div>
            </div>
            <div>
              <div className="flex justify-around w-full flex-row">
                <ArrowUpIcon
                  className={[
                    "w-20 h-20 transition duration-1000 ",
                    iconNewClass,
                  ].join(" ")}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-around w-full flex-row"></div>
          <div className="flex justify-around  flex-row  ">
            <Stats
              heartbeats={heartbeats}
              messages={messages}
              burnedPulses={burnedPulses}
            />
          </div>
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
      stat: (Number(burnedPulses) / 10_000_000).toFixed(7),
    },
  ];
  return (
    <div>
      <div className="p-6 bg-black bg-opacity-60 rounded-lg mb-6">
        <h2 className="text-3xl leading-6 font-bold text-gray-100 text-center">
          Statistics my dude
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
