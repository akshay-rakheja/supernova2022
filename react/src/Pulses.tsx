import { FC, useEffect } from "react";
import { useTitle } from "./Main";

const Pulses: FC = () => {
  const [_, setTitle] = useTitle();
  useEffect(() => {
    setTitle("Pulses");
  }, [setTitle]);
  return <div>Helloooooooo</div>;
};
export default Pulses;
