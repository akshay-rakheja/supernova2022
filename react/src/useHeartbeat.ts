import { useActor } from "./PlugProvider";
import config from "./config.json";
import { _SERVICE } from "./declarations/heartbeat/heartbeat.did";
import { idlFactory } from "./declarations/heartbeat";
const {
  canisters: { heartbeat },
} = config;
const useHeartbeat = () => {
  const actor = useActor<_SERVICE>(heartbeat, idlFactory);
  return actor;
};
export default useHeartbeat;
