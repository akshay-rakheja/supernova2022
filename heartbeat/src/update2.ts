import { Update, Query, int, UpdateAsync, CanisterResult } from "azle";

let counter: int = BigInt(0);
export function count(): Query<int> {
  return counter;
}

export function tick2(): Update<void> {
  console.log("Ticked me!!!!!");
  counter = counter + BigInt(2);
  // return counter;
}
