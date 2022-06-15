import { FC } from "react";
import { useTitle } from "./Main";
export const Canister: FC = () => {
  console.log("this is a canister");
  const [title, setTitle] = useTitle();
  setTitle("CANISTER");
  return <div>"hello"</div>;
};
export default Canister;
