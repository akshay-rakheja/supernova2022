import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import raw from "raw.macro";
import { FC, useEffect, useRef, useState } from "react";
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
      if (heartbeat) setPulses(await heartbeat?.get_pulses());
    })();
  }, [heartbeat]);
  useEffect(() => {
    setTitle("Pulses: " + (Number(pulses) / 10_000_000).toFixed(7));
  }, [setTitle, pulses]);
  const interval = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (interval.current) clearInterval(interval.current);
    interval.current = setInterval(async () => {
      if (heartbeat) setPulses(await heartbeat?.get_pulses());
    }, 2000);
    return () => {
      clearInterval(interval.current);
    };
  }, [heartbeat]);
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div>
      <button
        onClick={() => setShowHelp(true)}
        className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
      >
        <QuestionMarkCircleIcon className="h-6 w-6 text-white mr-2 inline" />{" "}
        Help
      </button>
      <button className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition">
        Buy Pulses
      </button>

      <button className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition">
        Send Pulses to
      </button>
      <ModalMD show={showHelp} setShow={setShowHelp} markdown={markdown} />
    </div>
  );
};
export default Pulses;
