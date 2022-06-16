import { useState, useEffect } from "react";
import { usePlug } from "./PlugProvider";
import { ActorSubclass } from "@dfinity/agent";

import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
export function useActor<T>(
  canisterId: string,
  interfaceFactory: InterfaceFactory
) {
  const { createActor } = usePlug();
  const [actor, setActor] = useState<ActorSubclass<T>>();
  useEffect(() => {
    (async () => {
      if (canisterId && createActor) {
        const newActor = await createActor<T>({ canisterId, interfaceFactory });
        setActor(newActor);
      }
    })();
  }, [createActor, canisterId]);
  return actor;
}
