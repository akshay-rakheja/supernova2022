import { Update, Query, int, nat } from "azle";

//#region counter functionality
let counter: int = BigInt(0);
export function count(): Query<int> {
  return counter;
}
export function tick2(): Update<int> {
  console.log("Ticked me!!!!!");
  counter = counter + BigInt(1);
  return counter;
}
//#region

//#region counter2 functionality
let counter2: nat = BigInt(0);
export function count_counter2(): Query<int> {
  return counter2;
}
export function counter2_tick(): Update<int> {
  console.log("Ticked me2!!!!!");
  counter2 = counter2 + BigInt(1);
  return counter2;
}

//#region counter2 functionality
let counter3: nat = BigInt(0);
export function count_counter3(): Query<int> {
  return counter3;
}
export function counter3_tick(): Update<int> {
  console.log("Ticked me!!!!!");
  counter3 = counter3 + BigInt(1);
  return counter;
}
//#endregion
