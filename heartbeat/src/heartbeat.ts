import {
  Query,
  ic,
  Heartbeat,
  CanisterResult,
  Canister,
  int,
  Variant,
  Update,
  nat,
  Principal,
  // Record,
} from "azle";

// type Update_Canister = Canister<{
//   tick(): CanisterResult<int>;
// }>;

type Registry = { [key: string]: UpdateInfo };
type UpdateInfo = { period: nat };
let registry: Registry = {};
let lastTime: nat = BigInt(0);
let period: nat = BigInt(10_000_000_000);
// let update_address: string = "";

export function add_update_address(
  newAddress: string,
  period: nat
): Update<void> {
  registry[newAddress] = { period };
}

// export function remove_update_address(address: Principal): Update<void> {
//   delete registry[address];
// }

// export function get_update_addresses(): Query<Registry> {
//   return registry;
// }

type TickResult = Variant<{
  ok?: int;
  err?: string;
}>;

function shouldTick(): boolean {
  return should(period);
}

function should(period: nat) {
  let now = ic.time();
  let delta = now - lastTime;
  return delta > period;
}

export function* heartbeat(): Heartbeat {
  if (shouldTick()) {
    for (const address of Object.keys(registry)) {
      console.log("I am checking", address);
        const { period: thisPeriod } = registry[address];
        if (should(thisPeriod)) {
          console.log("I will tick", address);
      
      //     // yield ic.call_raw(address, "tick", [], BigInt(0)); //@TODO RHD Experiment with late-binding
      //     const update: Update_Canister =
      //       ic.canisters.Update_Canister<Update_Canister>(address);
      //     const result: TickResult = yield update.tick();
      //     if (result.ok) {
      //       console.log("Tick: " + address + ": " + result.ok.toString());
      //     } else {
      //       console.log("Tick: " + address + ": " + result.err);
          } else {
            console.log("I will not tick");
          }
        }
    }
    console.log("Incrementing lastTime to ", ic.time());
    lastTime = ic.time();
  }
}
