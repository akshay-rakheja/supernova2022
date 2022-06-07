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

// export function hello_world(): Query<string> {
//   return "Hello, World!";
// }

type Update_Canister = Canister<{
  tick(): CanisterResult<int>;
}>;

let registry: string[] = [];
// let update_address: string = "";

export function add_update_address(newAddress: string): Update<void> {
  registry.push(newAddress);
}

// export function remove_update_address(address: string): Update<void> {
//   registry = registry.filter((a) => a !== address);
// }

export function get_update_addresses(): Query<string[]> {
  return registry;
}

type TickResult = Variant<{
  ok?: int;
  err?: string;
}>;

export function* heartbeat(): Heartbeat {
  const time = (ic.time() % BigInt(100_000_000_000)) / BigInt(1_000_000_000);
  if (time % BigInt(10) === BigInt(0)) {
    // console.log("Heartbeat2: " + time.toString());
    try {
      for (const address of registry) {
        const update: Update_Canister =
          ic.canisters.Update_Canister<Update_Canister>(address);
        const result: TickResult = yield update.tick();
        if (result.ok) {
          console.log("Tick: " + address + ": " + result.ok.toString());
        } else {
          console.log("Tick: " + address + ": " + result.err);
        }
      }
      // if (update_address !== "") {
      //   // let uc = ic.call_raw('rwlgt-iiaaa-aaaaa-aaaaa-cai','tick', [], BigInt(0));
      //   // console.log("Going to update tick!");
      //   // tick_result();
      //   let updateCanister =
      //     ic.canisters.Update_Canister<Update_Canister>(update_address);
      //   yield updateCanister.tick();
      //   // console.log("I updated tick!");
      //   // if (uc) {
      //   //     console.log("Found it!")
      //   //     uc.tick();
      //   // }
      //   // else{
      //   //     console.log("Not found!")
      //   // }
      // }
    } catch (e) {
      console.log("Error: " + (e as Error).message);
    }
  }
}

// export function* tick_result(): UpdateAsync<TickResult> {
//   let updateCanister =
//     ic.canisters.Update_Canister<Update_Canister>(update_address);
//   return yield updateCanister.tick();
// }
