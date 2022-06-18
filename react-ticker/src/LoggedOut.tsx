import React, { FC, Fragment, useCallback, useEffect, useState } from "react";
import background from "./assets/bg.png";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "./declarations/ticker2/ticker2.did";
import { createActor } from "./declarations/ticker2";
import { FaGithub } from "react-icons/fa";
import config from "./config.json";
import {
  ClipboardCopyIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import ModalMD from "./ModalMD";
import raw from "raw.macro";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
const markdown = raw("./about.md");

const {
  host,
  canisters: { ticker2 },
} = config[config.mode as "production" | "local"];

const useTicker2 = () => {
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  useEffect(() => {
    (async () => {
      const a = await createActor(ticker2, {
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
  const [isOpen, setIsOpen] = useState(false);
  const actor = useTicker2();
  const getStats = useCallback(async () => {
    if (actor) {
      console.log("Firing getstats");
      setCounter1(await actor.count());
      setCounter2(await actor.count_counter2());
      setCounter3(await actor.count_counter3());
    }
  }, [actor]);
  useEffect(() => {
    if (actor) {
      clearInterval(timer);
      timer = setInterval(getStats, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [getStats]);
  const [counter1, setCounter1] = useState(BigInt(0));
  const [counter2, setCounter2] = useState(BigInt(0));
  const [counter3, setCounter3] = useState(BigInt(0));
  useEffect(() => {
    setTimeout(() => {
      setNewClass("blur-xl");
      setPlugNewClass("opacity-100");
    }, 2000);
  }, []);
  useEffect(() => {
    if (counter1 || counter2 || counter3) {
      setNewClass("blur-xl");
      setIconNewClass("text-white translate-y-10");

      setTimeout(() => {
        setNewClass("blur-sm");
        setIconNewClass("text-black");
      }, 1500);
    }
  }, [counter1, counter2, counter3]);
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
              className="text-gray-200 hover:text-gray-100 hover:scale-105 transition duration-250"
            >
              <div className="flex flex-row ">
                <FaGithub size={20} />
                <span className="ml-2 font-medium">Fork us on GitHub</span>
              </div>
            </a>
            <div className=" font-bold text-white opacity-50">
              ...or just enjoy the pulses when a message hits
            </div>
          </div>
          <div></div>
          <div></div>

          <div className="flex justify-around w-full flex-row"></div>
          <div className="flex justify-around  flex-row  ">
            <Stats
              counter1={counter1}
              counter2={counter2}
              counter3={counter3}
            />
          </div>
          <div className="flex justify-around w-full flex-row">
            <div className="flex">
              <button
                className="mb-6 bg-black bg-opacity-80 border-2 border-orange-500 text-md font-medium text-white p-2 rounded-full transition hover:scale-105 transition-duration-250 hover:bg-opacity-60"
                onClick={(event) => {
                  setIsOpen(true);
                }}
              >
                <div className="flex flex-row">
                  <QuestionMarkCircleIcon className="h-6 w-6 mr-2" />
                  About This Service
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ModalMD show={isOpen} setShow={setIsOpen} markdown={markdown} />
    </Fragment>
  );
};

/* This example requires Tailwind CSS v2.0+ */

const Stats: FC<{
  counter1: bigint;
  counter3: bigint;
  counter2: bigint;
}> = ({ counter1, counter3, counter2 }) => {
  // const { createActor } = usePlug();
  const actor = useTicker2();
  const stats = [
    {
      name: "Calls to tick2",
      stat: counter1.toLocaleString(),
      clipboardText: "tick2",
      onClick: () => {
        toast("Resetting counter to 0");
        if (actor) actor.reset();
      },
    },
    {
      name: "Calls to counter2_tick",
      stat: counter2.toLocaleString(),
      clipboardText: "counter2_tick",
      onClick: () => {
        toast("Resetting counter2 to 0");
        if (actor) actor.counter2_reset();
      },
    },
    {
      name: "Calls to counter3_tick",
      stat: counter3.toLocaleString(),
      clipboardText: "counter3_tick",
      onClick: () => {
        toast("Resetting counter3 to 0");
        if (actor) actor.counter3_reset();
      },
    },
  ];
  return (
    <div>
      <div className="p-6 bg-black bg-opacity-60 rounded-lg mb-6">
        <h2 className="text-3xl leading-6 font-bold text-gray-100 text-center">
          Statistics
        </h2>
        <h3
          className="text-xl leading-6 font-bold text-gray-100 text-center cursor-pointer hover:text-gray-300"
          onClick={() => {
            copy(ticker2);
            toast("Copied canister id to clipboard");
          }}
        >
          for {ticker2}{" "}
          <ClipboardCopyIcon className="text-white h-6 w-6 ml-1.5 inline-block" />
        </h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 pointer">
          {stats.map((item) => (
            <div
              key={item.name}
              className="px-4 py-5 bg-gradient-to-r from-yellow-600 to-blue-800 text-white shadow rounded-lg overflow-hidden sm:p-6 border-4 border-orange-500"
            >
              <dt
                className="text-sm font-medium text-gray-100 truncate cursor-pointer hover:text-gray-300"
                onClick={() => {
                  copy(item.clipboardText);
                  toast(`Copied ${item.clipboardText} to clipboard`);
                }}
              >
                {item.name}
                <ClipboardCopyIcon className="text-white h-4 w-4 ml-1.5 inline-block" />
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-100">
                <div className="flex w-full justify-between items-baseline">
                  <div> {item.stat} </div>

                  <button
                    className="bg-orange-500 hover:bg-orange-800 transition text-xs text-white rounded-md p-1 h-6"
                    onClick={item.onClick}
                  >
                    Reset
                  </button>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default LoggedOut;
