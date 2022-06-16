import { useActor } from "./PlugProvider";
import config from "./config.json";
import { _SERVICE } from "./declarations/heartbeat/heartbeat.did";
import { createActor, idlFactory } from "./declarations/heartbeat";
import { ActorSubclass } from "@dfinity/agent";
import { useState, useEffect } from "react";
const {
  canisters: { heartbeat },
  host,
} = config[config.mode as "production" | "local"];
const useHeartbeat1 = () => {
  const actor = useActor<_SERVICE>(heartbeat, idlFactory);
  return actor;
};

const useHeartbeat2 = () => {
  console.log("USING LOCAL VERSION!!!!");
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
const useHeartbeat = config.mode === "local" ? useHeartbeat2 : useHeartbeat1;
export default useHeartbeat;
