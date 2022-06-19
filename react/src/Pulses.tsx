import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import raw from "raw.macro";
import { FC, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { useTitle } from "./Main";
import ModalMD from "./ModalMD";
import useHeartbeat from "./useHeartbeat";

const markdown = raw("./pulses.md");
const Pulses: FC = () => {
  const [_, setTitle] = useTitle();
  const [pulses, setPulses] = useState(BigInt(0));
  const heartbeat = useHeartbeat();
  useEffect(() => {
    (async () => {
      if (heartbeat) setPulses(await heartbeat?.myBalance());
    })();
  }, [heartbeat]);
  useEffect(() => {
    setTitle("DETI Tokens: " + (Number(pulses) / 10_000_000).toFixed(7));
  }, [setTitle, pulses]);
  const interval = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (interval.current) clearInterval(interval.current);
    interval.current = setInterval(async () => {
      if (heartbeat) setPulses(await heartbeat?.myBalance());
    }, 2000);
    return () => {
      clearInterval(interval.current);
    };
  }, [heartbeat]);
  const [minting, setMinting] = useState(false);
  return (
    <div>
      <div className="flex flex-row justify-center">
        <button
          onClick={async () => {
            toast("Minting a DETI...");
            setMinting(true);
            await heartbeat?.mint_pulses(BigInt(10_000_000));
            toast("Minted a DETI for you!");
            setMinting(false);
          }}
          disabled={minting || pulses > BigInt(100_000_000)}
          className={[
            "rounded-lg bg-orange-800 dark:bg-orange-500 font-medium dark:bg-opacity-80 text-white p-2 m-2 hover:bg-orange-800 transition",
            (minting || pulses > BigInt(100_000_000)) &&
              "bg-gray-500 dark:bg-gray-800 text-gray-300",
          ].join(" ")}
        >
          {pulses > BigInt(100_000_000)
            ? "You have your maximum quota of free DETI"
            : "Limited time only - mint one DETI"}
        </button>
        {/* 
        <button className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition">
          Send Pulses to
        </button> */}
      </div>
      <div className="flex flex-row justify-center">
        <article className="prose dark:prose-invert p-4 text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-black bg-opacity-40 m-4 rounded-lg max-h-full  overflow-scroll border-gray-300 dark:border-gray-600 border-opacity-40 border-2">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
      <div className="flex flex-row justify-center">
        <button
          onClick={async () => {
            setMinting(true);
            toast("Minting a DETI...");
            await heartbeat?.mint_pulses(BigInt(10_000_000));
            setMinting(false);
            toast("Minted a DETI for you!");
          }}
          disabled={minting || pulses > BigInt(100_000_000)}
          className={[
            "rounded-lg bg-orange-800 dark:bg-orange-500 font-medium dark:bg-opacity-80 text-white p-2 m-2 hover:bg-orange-800 transition",
            (minting || pulses > BigInt(100_000_000)) &&
              "bg-gray-500 dark:bg-gray-800 text-gray-300",
          ].join(" ")}
        >
          {pulses > BigInt(100_000_000)
            ? "You have your maximum quota of free DETI"
            : "Mint One Token (Good for sending about 10 messages)"}
        </button>
      </div>
      {/* <ModalMD show={showHelp} setShow={setShowHelp} markdown={markdown} /> */}
    </div>
  );
};
export default Pulses;
