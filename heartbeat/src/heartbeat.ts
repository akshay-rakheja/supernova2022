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
  nat64,
  nat8,
  // Record,
} from "azle";

type Update_Canister = Canister<{
  tick(): CanisterResult<int>;
}>;

type Registry = { [key: string]: UpdateInfo };
type UpdateInfo = { period: nat };
let lastUpdate: { [key: string]: nat } = {};
let registry: Registry = {};
let lastTime: nat = BigInt(0);
let period: nat = BigInt(10_000_000_000);
// let update_address: string = "";

export function add_update_address(
  newAddress: Principal,
  period: nat
): Update<void> {
  registry[newAddress] = { period };
  lastUpdate[newAddress] = ic.time();
}

export function remove_update_address(address: Principal): Update<void> {
  delete registry[address];
}

export function get_update_address(principal: Principal): Query<UpdateInfo> {
  return registry[principal];
}

type TickResult = Variant<{
  ok?: int;
  err?: string;
}>;

function shouldTick(): boolean {
  return should(period, lastTime);
}

function should(period: nat, comparison: nat = lastTime): boolean {
  let now = ic.time();
  let delta = now - comparison;
  return delta > period;
}

export function* heartbeat(): Heartbeat {
  if (shouldTick()) {
    for (const address of Object.keys(registry)) {
      console.log("I am checking", address);
      const { period: thisPeriod } = registry[address];
      if (should(thisPeriod, lastUpdate[address])) {
        lastUpdate[address] = ic.time();
        console.log("I will tick", address);
        console.log("arguments");
        // const argarray:nat8[] = "()".split("").map((s) => s.charCodeAt(0));
        // const argarray: nat8[] = [68, 73, 68, 76, 0, 0];
        // const { ok, err }: Variant<{ ok: nat8[]; err: string }> =
        //   yield ic.call_raw(address, "tick", argarray, 0n); //@TODO RHD Experiment with late-binding
        // console.log("I have ok and err", ok, err);
        const update = ic.canisters.Update_Canister<Update_Canister>(address);
        // .tick();
        const result: TickResult = yield update.tick();

        if (result.ok) {
          console.log("Tick: " + address + ": " + result.ok.toString());
        } else {
          console.log("Tick: " + address + ": " + result.err);
        }
      } else {
        // console.log("I will not tick");
      }
    }

    // console.log("Incrementing lastTime to ", ic.time());
    lastTime = ic.time();
  }
}
