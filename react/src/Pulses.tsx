import { FC, useEffect } from "react";
import { useTitle } from "./Main";

const Pulses: FC = () => {
  const [_, setTitle] = useTitle();
  useEffect(() => {
    setTitle("Pulses");
  }, [setTitle]);
  return (
    <div>
      <button className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition">
        Buy Pulses
      </button>

      <button className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition">
        Send Pulses to
      </button>
    </div>
  );
};
export default Pulses;
