import { Update, Query, int } from "azle";

let counter: int = BigInt(1);
export function count(): Query<int> {
  return counter;
}

export function tick2(): Update<int> {
  console.log("Ticked me!!!!!");
  counter = counter + BigInt(2);
  return counter;
}
