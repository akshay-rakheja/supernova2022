import { Query, ic, Heartbeat, Update, nat, Principal, nat8, Opt } from "azle";

//#region custom types
type Registry = { [key: string]: UpdateInfo[] };

type Schedule = {
  dow: Opt<nat8>;
  hour: nat8;
  minute: nat8;
};

type UpdateInfo = {
  period: Opt<nat>;
  func: string;
  schedule: Opt<Schedule>;
  canister: Principal;
};

//#endregion

//#region Time Manipulation Functions and constants

let January_2_2022_midnight_gmt = BigInt(1_641_081_600_000_000_000);
let second_in_ns = BigInt(1_000_000_000);
let minute_in_ns = second_in_ns * BigInt(60);
let hour_in_ns = minute_in_ns * BigInt(60);
let day_in_ns = hour_in_ns * BigInt(24);
let January_1_2017_midnight_gmt = BigInt(1_483_283_416_000_000_000); //First date before last leap second adjustment - min time that works reliably.

function to_midnight(referenceTime: nat) {
  if (referenceTime < January_1_2017_midnight_gmt)
    throw new Error("That did not work");
  const ns = referenceTime - January_2_2022_midnight_gmt;
  const ns_in_day = ns % day_in_ns;
  return referenceTime - ns_in_day;
}

function to_sunday(referenceTime: nat) {
  const midnight = to_midnight(referenceTime);
  const current_dow = dow(midnight);
  const sunday = midnight - day_in_ns * BigInt(current_dow);
  return sunday;
}

function to_next_weekday(referenceTime: nat, targetDow: nat8) {
  const sunday = to_sunday(referenceTime);
  const firstDow = sunday + day_in_ns * BigInt(targetDow);
  if (firstDow > referenceTime) return firstDow;
  return firstDow + day_in_ns * BigInt(7);
}

function to_tomorrow(referenceTime: nat) {
  const midnight = to_midnight(referenceTime);
  return midnight + day_in_ns;
}

function add_hours(referenceMidnight: nat, targetHours: nat8) {
  return referenceMidnight + hour_in_ns * BigInt(targetHours);
}

function add_minutes(referenceHOur: nat, targetMinutes: nat8) {
  return referenceHOur + minute_in_ns * BigInt(targetMinutes);
}

function dow(referenceTime: nat): nat8 {
  const ns = referenceTime - January_2_2022_midnight_gmt;
  const days = ns / day_in_ns;
  const dow = days % BigInt(7);
  return Number(dow);
}

function currentDow(): nat8 {
  return dow(ic.time());
}

function hour(referenceTime: nat): nat8 {
  const ns = referenceTime - January_2_2022_midnight_gmt;
  const ns_in_day = ns % day_in_ns;
  const hours = ns_in_day / hour_in_ns;
  return Number(hours);
}

function currentHour(): nat8 {
  return hour(ic.time());
}

function minute(referenceTime: nat): nat8 {
  const ns = referenceTime - January_2_2022_midnight_gmt;
  const ns_in_day = ns % day_in_ns;
  const minute_ns = ns_in_day % hour_in_ns;
  const minutes = minute_ns / minute_in_ns;
  return Number(minutes);
}

function currentMinute(): nat8 {
  return minute(ic.time());
}

//#endregion

//#region internal functions and state
let lastUpdate: { [key: string]: nat[] } = {};
let firedPulses: { [key: string]: nat } = {};
let allowedPulses: { [key: string]: nat } = {};
let registry: Registry = {};
let lastTime: nat = BigInt(0);
let period: nat = BigInt(10);

function shouldTick(): boolean {
  return should(period, lastTime);
}

function should(period: nat, comparison: nat = lastTime): boolean {
  let now = ic.time();
  let delta = (now - comparison) / BigInt(1_000_000_000);
  return delta > period;
}

function* sendPulse(address: Principal, index: number) {
  const { func } = registry[address][index];
  firedPulses[address] = firedPulses[address] + BigInt(1);
  const nullArguments: nat8[] = [68, 73, 68, 76, 0, 0]; // DIDL + 2 nulls
  yield ic.call_raw(address, func, nullArguments, 0n); //@TODO RHD SUpport passing an argument other than null
}

function setNextUpdate(schedule: Schedule) {
  let nextUpdate: nat;
  if (schedule.dow === null) nextUpdate = to_tomorrow(ic.time());
  else nextUpdate = to_next_weekday(ic.time(), schedule.dow);
  nextUpdate = add_hours(nextUpdate, schedule.hour);
  nextUpdate = add_minutes(nextUpdate, schedule.minute);
  if (nextUpdate > ic.time() + day_in_ns * BigInt(7)) {
    nextUpdate = nextUpdate - day_in_ns * BigInt(7);
  }
  if (schedule.dow === null && nextUpdate > ic.time() + day_in_ns) {
    nextUpdate = nextUpdate - day_in_ns;
  }
  return nextUpdate;
}

//#endregion

//#region interface
export function add_period(
  canister: Principal,
  period_in_seconds: nat,
  func: string
): Update<nat> {
  if (period_in_seconds < 10) throw new Error("Period must be at least 10s");
  if (!registry[canister]) registry[canister] = [];
  registry[canister].push({
    period: period_in_seconds * second_in_ns,
    func,
    canister,
    schedule: null,
  });
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  lastUpdate[canister].push(ic.time());
  firedPulses[canister] = BigInt(0);
  if (allowedPulses[canister] === null) allowedPulses[canister] = BigInt(10);
  return lastUpdate[canister][lastUpdate[canister].length - 1] + period;
}

export function add_weekly_schedule(
  canister: Principal,
  day_of_week: nat8,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat> {
  const schedule: Schedule = { dow: day_of_week, hour: hour_of_day, minute };
  if (!registry[canister]) registry[canister] = [];
  registry[canister].push({ func, canister, schedule, period: null });
  firedPulses[canister] = BigInt(0);
  if (allowedPulses[canister] === null) allowedPulses[canister] = BigInt(10);
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  lastUpdate[canister].push(setNextUpdate(schedule));
  return lastUpdate[canister][lastUpdate[canister].length - 1];
}
export function add_daily_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat> {
  console.log("A");
  const schedule: Schedule = { dow: null, hour: hour_of_day, minute };
  console.log("B");
  if (!registry[canister]) registry[canister] = [];
  console.log("C");
  registry[canister].push({ func, canister, schedule, period: null });
  console.log("D");
  firedPulses[canister] = BigInt(0);
  console.log("E");
  if (allowedPulses[canister] === null) allowedPulses[canister] = BigInt(10);
  console.log("F");
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  console.log("G");
  lastUpdate[canister].push(setNextUpdate(schedule));
  console.log("H");
  return lastUpdate[canister][lastUpdate[canister].length - 1];
}

export function remove(address: Principal, index: nat8): Update<void> {
  delete registry[address][index];
}

export function get_one(principal: Principal, index: nat8): Query<UpdateInfo> {
  return registry[principal][index];
}

export function get_count(principal: Principal): Query<nat8> {
  return registry[principal].length;
}

export function get_all(principal: Principal): Query<UpdateInfo[]> {
  return registry[principal];
}

export function get_used_pulses(principal: Principal): Query<nat> {
  return firedPulses[principal];
}

export function get_available_pulses(principal: Principal): Query<nat> {
  return allowedPulses[principal] - firedPulses[principal];
}
export function get_next_update_time(
  principal: Principal,
  index: nat8
): Query<nat> {
  if (registry[principal][index].period !== null) {
    return lastUpdate[principal][index] + registry[principal][index].period!;
  } else {
    return lastUpdate[principal][index];
  }
}

export function getDisplayTime(): Query<string> {
  const dow = currentDow();
  const hour = currentHour();
  const minute = currentMinute();
  const time_in_seconds = ic.time() / BigInt(second_in_ns);
  const result = `dow  ${dow.toString()} hour ${hour.toString()} minute ${minute.toString()} unixTime: ${time_in_seconds}}`;
  return result;
}

export function getNow(): Query<nat> {
  return ic.time();
}

export function* heartbeat(): Heartbeat {
  if (shouldTick()) {
    for (const address in Object.keys(registry)) {
      for (let index = 0; index < registry[address].length; index++) {
        const updateInfo = registry[address][index];
        const { period: thisPeriod, schedule, address } = updateInfo;
        if (firedPulses[address] < allowedPulses[address]) {
          lastTime = ic.time();
          if (thisPeriod !== null) {
            if (should(thisPeriod, lastUpdate[address][index])) {
              lastUpdate[address][index] = ic.time();
              yield* sendPulse(address, index);
            }
          } else if (schedule !== null) {
            if (lastUpdate[address][index] < ic.time()) {
              const nextUpdate = setNextUpdate(schedule);
              lastUpdate[address][index] = nextUpdate;
              yield* sendPulse(address, index);
            }
          }
        }
      }
    }
  }
}
//#endregion
