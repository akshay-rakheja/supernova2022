import {
  Query,
  ic,
  Heartbeat,
  CanisterResult,
  UpdateAsync,
  Canister,
  int,
  Variant,
  Update,
  Opt,
} from "azle";

export function hello_world(): Query<string> {
  return "Hello, World!";
}

type Update_Canister = Canister<{
  tick(): CanisterResult<int>;
}>;

let update_address: string = "";

export function set_update_address(newAddress: string): Update<void> {
  update_address = newAddress;
}

export function get_update_address(): Query<string> {
  return update_address;
}

type TickResult = Variant<{
  ok?: int;
  err?: string;
}>;

export function* heartbeat(): Heartbeat {
  const time = (ic.time() % BigInt(100_000_000_000)) / BigInt(1_000_000_000);
  if (time % BigInt(10) === BigInt(0)) {
    console.log("Heartbeat2: " + time.toString());
    try {
      if (update_address !== "") {
        // let uc = ic.call_raw('rwlgt-iiaaa-aaaaa-aaaaa-cai','tick', [], BigInt(0));
        console.log("Going to update tick!");
        tick_result();
        console.log("I updated tick!");
        // if (uc) {
        //     console.log("Found it!")
        //     uc.tick();
        // }
        // else{
        //     console.log("Not found!")
        // }
      }
    } catch (e) {
      console.log("Error: " + (e as Error).message);
    }
  }
}

export function* tick_result(): UpdateAsync<TickResult> {
  let updateCanister =
    ic.canisters.Update_Canister<Update_Canister>(update_address);
  return yield updateCanister.tick();
}
