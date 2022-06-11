import {
  Query,
  ic,
  Heartbeat,
  Update,
  nat,
  Principal,
  nat8,
  Opt,
  nat32,
} from "azle";

//#region custom types
type Registry = { [key: string]: UpdateInfo[] };
type MessageRegistry = { [key: string]: Message[] };
type Schedule = {
  dow: Opt<nat8>;
  hour: nat8;
  minute: nat8;
};

type UpdateInfo = {
  owner: Principal;
  period: Opt<nat>;
  func: string;
  schedule: Opt<Schedule>;
  canister: Principal;
  args: Opt<nat8[]>;
};

type Message = {
  owner: Principal;
  time: nat;
  canister: Principal;
  func: string;
  args: Opt<nat8[]>;
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
let messageRegistry: MessageRegistry = {};
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

function* sendPulse(address: Principal, func: string, args: Opt<nat8[]>) {
  firedPulses[address] = firedPulses[address] + BigInt(1);
  if (!args) args = [68, 73, 68, 76, 0, 0]; // DIDL + 2 nulls
  yield ic.call_raw(address, func, args, 0n); //@TODO RHD SUpport passing an argument other than null
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

//#region Interface for schedules
export function add_period(
  canister: Principal,
  period_in_seconds: nat,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  if (period_in_seconds < 10) throw new Error("Period must be at least 10s");
  if (!registry[canister]) registry[canister] = [];
  registry[canister].push({
    owner,
    period: period_in_seconds * second_in_ns,
    func,
    canister,
    schedule: null,
    args: null,
  });
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  lastUpdate[canister].push(ic.time());
  return lastUpdate[canister].length - 1;
}

export function add_weekly_schedule(
  canister: Principal,
  day_of_week: nat8,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = { dow: day_of_week, hour: hour_of_day, minute };
  if (!registry[canister]) registry[canister] = [];
  registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  lastUpdate[canister].push(setNextUpdate(schedule));
  return lastUpdate[canister].length - 1;
}
export function add_daily_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = { dow: null, hour: hour_of_day, minute };
  if (!registry[canister]) registry[canister] = [];
  registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[canister]) lastUpdate[canister] = [];
  lastUpdate[canister].push(setNextUpdate(schedule));
  return lastUpdate[canister].length - 1;
}

export function remove(address: Principal, index: nat32): Update<void> {
  if (ic.caller() !== registry[address][index].owner)
    throw new Error("Not the owner of this schedule");
  delete registry[address][index];
}

export function get_one(principal: Principal, index: nat32): Query<UpdateInfo> {
  return registry[principal][index];
}

export function get_count(principal: Principal): Query<nat32> {
  return registry[principal].length;
}

export function get_all(principal: Principal): Query<UpdateInfo[]> {
  return registry[principal];
}

export function get_next_update_time(
  principal: Principal,
  index: nat32
): Query<nat> {
  if (registry[principal][index].period !== null) {
    return lastUpdate[principal][index] + registry[principal][index].period!;
  } else {
    return lastUpdate[principal][index];
  }
}
//#endregion

//#region Interface for messages (one-time events)
export function add_message(
  canister: Principal,
  unix_time_code_in_seconds: nat,
  func: string,
  args: Opt<nat8[]>
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const time = unix_time_code_in_seconds * second_in_ns;
  if (time < ic.time()) throw new Error("Time must be in the future");
  if (!messageRegistry[canister]) messageRegistry[canister] = [];
  messageRegistry[canister].push({ args, func, canister, time, owner });
  return messageRegistry[canister].length - 1;
}

export function remove_message(
  canister: Principal,
  index: nat32
): Update<nat32> {
  if (ic.caller() !== messageRegistry[canister][index].owner)
    throw new Error("Not the owner of this schedule");
  delete messageRegistry[canister][index];
  return messageRegistry[canister].length;
}

export function get_one_message(
  principal: Principal,
  index: nat32
): Query<Message> {
  return messageRegistry[principal][index];
}

export function get_message_count(principal: Principal): Query<nat32> {
  return messageRegistry[principal].length;
}

export function get_messages(principal: Principal): Query<Message[]> {
  return messageRegistry[principal];
}
//#endregion

//#region Interface for pulses

export function mint_pulses(pulseCount: nat): Update<nat> {
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  const principal = ic.caller();
  if (!allowedPulses[principal]) {
    allowedPulses[principal] = 0n;
    firedPulses[principal] = 0n;
  }
  allowedPulses[principal] += pulseCount;
  return allowedPulses[principal];
}

export function mint_pulses_for(
  pulseCount: nat,
  onBehalfOf: Principal
): Update<nat> {
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  const principal = onBehalfOf;
  if (!allowedPulses[principal]) {
    allowedPulses[principal] = 0n;
    firedPulses[principal] = 0n;
  }
  allowedPulses[principal] += pulseCount;
  return allowedPulses[principal];
}

export function get_burned_pulses(): Query<nat> {
  const principal = ic.caller();
  return firedPulses[principal];
}

export function get_pulses(): Query<nat> {
  const principal = ic.caller();
  return allowedPulses[principal] - firedPulses[principal];
}

export function get_pulses_for(principal: Principal): Query<nat> {
  return allowedPulses[principal] - firedPulses[principal];
}

export function transfer_pulses(pulseCount: nat, to: Principal): Update<nat> {
  const principal = ic.caller();
  if (pulseCount > allowedPulses[principal] - firedPulses[principal]) {
    throw new Error("you don't have that many pulses available");
  }
  if (!allowedPulses[to]) {
    allowedPulses[to] = 0n;
    firedPulses[to] = 0n;
  }
  allowedPulses[principal] -= pulseCount;
  allowedPulses[to] += pulseCount;
  return allowedPulses[principal];
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

export function getNowSeconds(): Query<nat32> {
  return Number(ic.time() / second_in_ns);
}

export function* heartbeat(): Heartbeat {
  if (shouldTick()) {
    for (const address in Object.keys(registry)) {
      if (firedPulses[address] < allowedPulses[address]) {
        for (let index = 0; index < registry[address].length; index++) {
          if (registry[address][index] === null) continue;
          const updateInfo = registry[address][index];
          const { period: thisPeriod, schedule, func, args } = updateInfo;
          if (firedPulses[address] < allowedPulses[address]) {
            lastTime = ic.time();
            if (thisPeriod !== null) {
              if (should(thisPeriod, lastUpdate[address][index])) {
                lastUpdate[address][index] = ic.time();
                yield* sendPulse(address, func, args);
              }
            } else if (schedule !== null) {
              if (lastUpdate[address][index] < ic.time()) {
                const nextUpdate = setNextUpdate(schedule);
                lastUpdate[address][index] = nextUpdate;
                yield* sendPulse(address, func, args);
              }
            }
          }
        }
      }
    }
    for (const address in Object.keys(messageRegistry)) {
      if (firedPulses[address] < allowedPulses[address]) {
        for (let x = messageRegistry[address].length - 1; x > -1; x--) {
          if (messageRegistry[address][x] === null) continue;
          if (firedPulses[address] < allowedPulses[address]) {
            const { time, args, canister, func } = messageRegistry[address][x];
            if (time < ic.time()) {
              //Send the message
              delete messageRegistry[address][x];
              sendPulse(address, func, args);
            }
          }
        }
      }
    }
  }
}

export function whoami(): Query<Principal> {
  return ic.caller();
}
//#endregion
