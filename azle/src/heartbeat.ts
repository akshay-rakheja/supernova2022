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
  Init,
  UpdateAsync,
  Stable,
} from "azle";
import { Ledger } from "azle/canisters/ledger";

//#region custom types
type Registry = { [key: string]: UpdateInfo[] };
type MessageRegistry = { [key: string]: Message[] };
type PulseLedger = { [key: string]: nat };
type Schedule = {
  dom: Opt<nat8>;
  month: Opt<nat8>;
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

type StableStore = Stable<{
  registry: Registry;
  messageRegistry: MessageRegistry;
  allowedPulses: PulseLedger;
  usedPulses: PulseLedger;
  pulseLedger: PulseLedger;
  owner: Principal;
  pulse_price: nat;
  check_price_in_pulses: nat;
  pulse_price_in_pulses: nat;
  accountId: string;
  lastUpdate: { [key: string]: nat[] };
  lastTime: nat;
  period: nat;
}>;

function getStable() {
  return ic.stableStorage<StableStore>();
}

//#endregion

//#region Time Manipulation Functions and constants

const January_2_2022_midnight_gmt = BigInt(1_641_081_600_000_000_000);
const second_in_ns = BigInt(1_000_000_000);
const minute_in_ns = second_in_ns * BigInt(60);
const hour_in_ns = minute_in_ns * BigInt(60);
const day_in_ns = hour_in_ns * BigInt(24);
const January_1_2017_midnight_gmt = BigInt(1_483_283_416_000_000_000); //First date before last leap second adjustment - min time that works reliably.

const daysInMonths = [
  31n,
  28n,
  31n,
  30n,
  31n,
  30n,
  31n,
  31n,
  30n,
  31n,
  30n,
  31n,
];
const daysInMonthsLeapYear = [
  31n,
  29n,
  31n,
  30n,
  31n,
  30n,
  31n,
  31n,
  30n,
  31n,
  30n,
  31n,
];
function isLeapYear(year: number) {
  return year % 100 === 0 && year % 400 !== 0;
}
function year(referenceTime: nat) {
  const days = daysSinceJanuary22022(referenceTime) + 2n; //give me days since December 31, 2021 - 1 is Jan 1 2022, etc
  let referenceYear = 2022;
  let countedDays = 0n;
  while (true) {
    countedDays += isLeapYear(referenceYear) ? 366n : 365n;
    if (countedDays > days) break;
    referenceYear++;
  }
  return referenceYear;
}

function month(referenceTime: nat) {
  const days = daysSinceJanuary22022(referenceTime) + 2n; //give me days since December 31, 2021 - 1 is Jan 1 2022, etc
  let referenceYear = 2022;
  let countedDays = 0n;
  while (true) {
    countedDays += isLeapYear(referenceYear) ? 366n : 365n;
    if (countedDays > days) break;
    referenceYear++;
  }
  countedDays -= isLeapYear(referenceYear) ? 366n : 365n;
  const months = isLeapYear(referenceYear)
    ? daysInMonthsLeapYear
    : daysInMonths;
  let thisMonth = -1;
  for (let month = 0; month < months.length; month++) {
    countedDays += months[month];
    if (countedDays > days) {
      thisMonth = month;
      break;
    }
  }
  return thisMonth;
}

function day_of_month(referenceTime: nat) {
  const days = daysSinceJanuary22022(referenceTime) + 2n; //give me days since December 31, 2021 - 1 is Jan 1 2022, etc
  let referenceYear = 2022;
  let countedDays = 0n;
  while (true) {
    countedDays += isLeapYear(referenceYear) ? 366n : 365n;
    if (countedDays > days) break;
    referenceYear++;
  }
  countedDays -= isLeapYear(referenceYear) ? 366n : 365n;
  const months = isLeapYear(referenceYear)
    ? daysInMonthsLeapYear
    : daysInMonths;
  let thisMonth = -1;
  for (let month = 0; month < months.length; month++) {
    countedDays += months[month];
    if (countedDays > days) {
      thisMonth = month;
      break;
    }
  }
  countedDays -= months[thisMonth];
  return Number(days - countedDays + 1n); //Remember day of month starts with 1 as the first day of the month
}

function last_day_of_month(referenceTime: nat) {
  const days = daysSinceJanuary22022(referenceTime) + 2n; //give me days since December 31, 2021 - 1 is Jan 1 2022, etc
  let referenceYear = 2022;
  let countedDays = 0n;
  while (true) {
    countedDays += isLeapYear(referenceYear) ? 366n : 365n;
    if (countedDays > days) break;
    referenceYear++;
  }
  countedDays -= isLeapYear(referenceYear) ? 366n : 365n;
  const months = isLeapYear(referenceYear)
    ? daysInMonthsLeapYear
    : daysInMonths;
  let thisMonth = -1;
  for (let month = 0; month < months.length; month++) {
    countedDays += months[month];
    if (countedDays > days) {
      thisMonth = month;
      break;
    }
  }
  countedDays -= months[thisMonth];
  return days - countedDays + 1n === months[thisMonth]; //Remember day of month starts with 1 as the first day of the month
}

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

function daysSinceJanuary22022(referenceTime: nat) {
  if (referenceTime < January_1_2017_midnight_gmt)
    throw new Error("Only works with dates in 2017 forward");
  const ns = referenceTime - January_2_2022_midnight_gmt;

  return ns / day_in_ns;
}

function dow(referenceTime: nat): nat8 {
  const days = daysSinceJanuary22022(referenceTime);
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

function shouldTick(): boolean {
  return should(getStable().period, getStable().lastTime);
}

function should(period: nat, comparison?: nat): boolean {
  if (!comparison) comparison = getStable().lastTime;
  let now = ic.time();
  let delta = (now - comparison) / BigInt(1_000_000_000);
  return delta > period;
}

function availablePulses(owner: Principal) {
  return getStable().allowedPulses[owner] - getStable().usedPulses[owner];
}
function canPulse(owner: Principal) {
  return availablePulses(owner) > getStable().pulse_price_in_pulses;
}
function canCheck(owner: Principal) {
  return availablePulses(owner) > getStable().check_price_in_pulses;
}

function burn_pulses(owner: Principal, pulses: bigint) {
  getStable().usedPulses[owner] += pulses;
}

function* sendPulse(
  address: Principal,
  func: string,
  args: Opt<nat8[]>,
  owner: Principal
) {
  burn_pulses(owner, getStable().pulse_price_in_pulses);
  if (!args) args = [68, 73, 68, 76, 0, 0]; // DIDL + 2 nulls
  yield ic.call_raw(address, func, args, 0n); //@TODO RHD SUpport passing an argument other than null
}

function setNextUpdate(schedule: Schedule) {
  let nextUpdate: nat;
  //Three ways to get the date
  if (schedule.dow) {
    nextUpdate = to_next_weekday(ic.time(), schedule.dow);
  } else if (schedule.dom) {
    //get the next dom that I match to
    nextUpdate = to_tomorrow(ic.time());
    while (true) {
      if (day_of_month(nextUpdate) === schedule.dom) break;
      nextUpdate += day_in_ns;
    }
  } else if (schedule.month) {
    //get the next dom that I match to
    nextUpdate = to_midnight(ic.time());
    while (true) {
      if (
        day_of_month(nextUpdate) === schedule.dom &&
        month(nextUpdate) === schedule.month
      )
        break;
      nextUpdate += day_in_ns;
    }
  } else {
    //Daily schedule
    nextUpdate = to_tomorrow(ic.time());
  }

  nextUpdate = add_hours(nextUpdate, schedule.hour);
  nextUpdate = add_minutes(nextUpdate, schedule.minute);
  if (schedule.dow !== null && nextUpdate > ic.time() + day_in_ns * BigInt(7)) {
    nextUpdate = nextUpdate - day_in_ns * BigInt(7);
  }
  if (
    schedule.dow === null &&
    schedule.month === null &&
    schedule.dom === null &&
    nextUpdate > ic.time() + day_in_ns
  ) {
    nextUpdate = nextUpdate - day_in_ns;
  }

  //@TODO add rewind functionality for when setting the monthly or yearly
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
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  if (period_in_seconds < 10) throw new Error("Period must be at least 10s");
  if (!getStable().registry[canister]) getStable().registry[canister] = [];
  getStable().registry[canister].push({
    owner,
    period: period_in_seconds * second_in_ns,
    func,
    canister,
    schedule: null,
    args: null,
  });
  if (!getStable().lastUpdate[canister]) getStable().lastUpdate[canister] = [];
  getStable().lastUpdate[canister].push(ic.time());
  return getStable().lastUpdate[canister].length - 1;
}

export function add_weekly_schedule(
  canister: Principal,
  day_of_week: nat8,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: day_of_week,
    hour: hour_of_day,
    minute,
    dom: null,
    month: null,
  };
  if (!getStable().registry[canister]) getStable().registry[canister] = [];
  getStable().registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!getStable().lastUpdate[canister]) getStable().lastUpdate[canister] = [];
  getStable().lastUpdate[canister].push(setNextUpdate(schedule));
  return getStable().lastUpdate[canister].length - 1;
}
export function add_daily_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: null,
    month: null,
  };
  if (!getStable().registry[canister]) getStable().registry[canister] = [];
  getStable().registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!getStable().lastUpdate[canister]) getStable().lastUpdate[canister] = [];
  getStable().lastUpdate[canister].push(setNextUpdate(schedule));
  return getStable().lastUpdate[canister].length - 1;
}

export function add_monthly_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  day_of_month: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: day_of_month,
    month: null,
  };
  if (!getStable().registry[canister]) getStable().registry[canister] = [];
  getStable().registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!getStable().lastUpdate[canister]) getStable().lastUpdate[canister] = [];
  getStable().lastUpdate[canister].push(setNextUpdate(schedule));
  return getStable().lastUpdate[canister].length - 1;
}
export function add_yearly_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  day_of_month: nat8,
  month: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: day_of_month,
    month,
  };
  if (!getStable().registry[canister]) getStable().registry[canister] = [];
  getStable().registry[canister].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!getStable().lastUpdate[canister]) getStable().lastUpdate[canister] = [];
  getStable().lastUpdate[canister].push(setNextUpdate(schedule));
  return getStable().lastUpdate[canister].length - 1;
}

export function remove(address: Principal, index: nat32): Update<void> {
  if (ic.caller() !== getStable().registry[address][index].owner)
    throw new Error("Not the owner of this schedule");
  delete getStable().registry[address][index];
}

export function get_one(principal: Principal, index: nat32): Query<UpdateInfo> {
  return getStable().registry[principal][index];
}

export function get_count(principal: Principal): Query<nat32> {
  return getStable().registry[principal].length;
}

export function get_all(principal: Principal): Query<UpdateInfo[]> {
  return getStable().registry[principal];
}

export function get_next_update_time(
  principal: Principal,
  index: nat32
): Query<nat> {
  if (getStable().registry[principal][index].period !== null) {
    return (
      getStable().lastUpdate[principal][index] +
      getStable().registry[principal][index].period!
    );
  } else {
    return getStable().lastUpdate[principal][index];
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
  if (getStable().allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const time = unix_time_code_in_seconds * second_in_ns;
  if (time < ic.time()) throw new Error("Time must be in the future");
  if (!getStable().messageRegistry[canister])
    getStable().messageRegistry[canister] = [];
  getStable().messageRegistry[canister].push({
    args,
    func,
    canister,
    time,
    owner,
  });
  return getStable().messageRegistry[canister].length - 1;
}

export function remove_message(
  canister: Principal,
  index: nat32
): Update<nat32> {
  if (ic.caller() !== getStable().messageRegistry[canister][index].owner)
    throw new Error("Not the owner of this schedule");
  delete getStable().messageRegistry[canister][index];
  return getStable().messageRegistry[canister].length;
}

export function get_one_message(
  principal: Principal,
  index: nat32
): Query<Message> {
  return getStable().messageRegistry[principal][index];
}

export function get_message_count(principal: Principal): Query<nat32> {
  return getStable().messageRegistry[principal].length;
}

export function get_messages(principal: Principal): Query<Message[]> {
  return getStable().messageRegistry[principal];
}
//#endregion

//#region owner management
export function init(): Init {
  getStable().owner = ic.caller();
  getStable().allowedPulses = {};
  getStable().messageRegistry = {};
  getStable().pulseLedger = {};
  getStable().registry = {};
  getStable().usedPulses = {};
  getStable().lastTime = ic.time();
  getStable().lastUpdate = {};
  getStable().period = 10n;
  getStable().accountId = "";
  getStable().pulse_price = 1n; // price denominated in e8s (ICP * 1e-8)
  getStable().pulse_price_in_pulses = 10_000_000n; // (0.1 PULSE)
  getStable().check_price_in_pulses = 10n; // (0.00000001 PULSE)
}
export function set_owner(newOwner: Principal): Update<Principal> {
  getStable().owner = newOwner;
  return newOwner;
}

export function is_owner(): Query<boolean> {
  return ic.caller() === getStable().owner;
}
//#endregion

//#region Interface for pulses

export function set_pulse_price(newPrice: nat): Update<nat> {
  const caller = ic.caller();
  if (caller !== getStable().owner)
    throw new Error("This is not the owner of the container");
  getStable().pulse_price = newPrice;
  return newPrice;
}

export function get_pulse_price(): Query<nat> {
  return getStable().pulse_price;
}

export function set_pulse_cost(newCost: nat): Update<nat> {
  const caller = ic.caller();
  if (caller !== getStable().owner)
    throw new Error("This is not the owner of the container");
  getStable().pulse_price_in_pulses = newCost;
  return newCost;
}
export function set_check_cost(newCost: nat): Update<nat> {
  const caller = ic.caller();
  if (caller !== getStable().owner)
    throw new Error("This is not the owner of the container");
  getStable().check_price_in_pulses = newCost;
  return newCost;
}
export function set_account_id(newAccountId: string): Update<string> {
  getStable().accountId = newAccountId;
  return newAccountId;
}
export function get_account_id(): Query<string> {
  return getStable().accountId;
}
const ICPCanister = ic.canisters.Ledger<Ledger>("r7inp-6aaaa-aaaaa-aaabq-cai");

export function* mint_pulses(
  blockNumber: nat
): UpdateAsync<{ ok: Opt<nat>; err: Opt<string> }> {
  //let's check the ledger
  const result = yield ICPCanister.query_blocks({
    start: blockNumber,
    length: 1n,
  });
  if (result.ok === null) throw new Error("Could not query for this block");
  const transfer = result.ok?.blocks[0].transaction?.operation?.Transfer;
  if (!transfer) throw new Error("No transfer on the block");
  const { amount, from, to } = transfer;
  // const toPrincipal = ICPCanister.
  // if(to. === ic.id()
  if (Buffer.from(to).toString("hex") !== getStable().accountId) {
    console.log(
      "That did not work for me",
      Buffer.from(to).toString("hex"),
      getStable().accountId
    );
    throw new Error("Oh noes");
  }
  const pulseCount = amount.e8s / getStable().pulse_price;
  const principal = ic.caller();
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  if (!getStable().allowedPulses[principal]) {
    getStable().allowedPulses[principal] = 0n;
    getStable().usedPulses[principal] = 0n;
  }
  getStable().allowedPulses[principal] += pulseCount;
  return { ok: getStable().allowedPulses[principal], err: null };
}

export function mint_pulses_for(
  pulseCount: nat,
  onBehalfOf: Principal
): Update<nat> {
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  const principal = onBehalfOf;
  if (!getStable().allowedPulses[principal]) {
    getStable().allowedPulses[principal] = 0n;
    getStable().usedPulses[principal] = 0n;
  }
  getStable().allowedPulses[principal] += pulseCount;
  return getStable().allowedPulses[principal];
}

export function get_burned_pulses(): Query<nat> {
  const principal = ic.caller();
  return getStable().usedPulses[principal];
}

export function get_pulses(): Query<nat> {
  const principal = ic.caller();
  return (
    getStable().allowedPulses[principal] - getStable().usedPulses[principal]
  );
}

export function get_pulses_for(principal: Principal): Query<nat> {
  return (
    getStable().allowedPulses[principal] - getStable().usedPulses[principal]
  );
}

export function transfer_pulses(pulseCount: nat, to: Principal): Update<nat> {
  const principal = ic.caller();
  if (
    pulseCount >
    getStable().allowedPulses[principal] - getStable().usedPulses[principal]
  ) {
    throw new Error("you don't have that many pulses available");
  }
  if (!getStable().allowedPulses[to]) {
    getStable().allowedPulses[to] = 0n;
    getStable().usedPulses[to] = 0n;
  }
  getStable().allowedPulses[principal] -= pulseCount;
  getStable().allowedPulses[to] += pulseCount;
  return getStable().allowedPulses[principal];
}

//#region Interface for current time utility functions

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
//#endregion

//#region Heartbeat

export function* heartbeat(): Heartbeat {
  if (shouldTick()) {
    for (const address in Object.keys(getStable().registry)) {
      for (
        let index = 0;
        index < getStable().registry[address].length;
        index++
      ) {
        if (getStable().registry[address][index] === null) continue;
        const updateInfo = getStable().registry[address][index];
        const { period: thisPeriod, schedule, func, args, owner } = updateInfo;
        if (canCheck(owner)) {
          burn_pulses(owner, getStable().check_price_in_pulses);
          if (canPulse(owner)) {
            getStable().lastTime = ic.time();
            if (thisPeriod !== null) {
              if (should(thisPeriod, getStable().lastUpdate[address][index])) {
                getStable().lastUpdate[address][index] = ic.time();
                yield* sendPulse(address, func, args, owner);
              }
            } else if (schedule !== null) {
              if (getStable().lastUpdate[address][index] < ic.time()) {
                const nextUpdate = setNextUpdate(schedule);
                getStable().lastUpdate[address][index] = nextUpdate;
                yield* sendPulse(address, func, args, owner);
              }
            }
          }
        }
      }
    }
  }
  for (const address in Object.keys(getStable().messageRegistry)) {
    for (let x = getStable().messageRegistry[address].length - 1; x > -1; x--) {
      if (getStable().messageRegistry[address][x] === null) continue;
      const { time, args, canister, func, owner } =
        getStable().messageRegistry[address][x];
      if (canCheck(owner)) {
        burn_pulses(owner, getStable().check_price_in_pulses);
        if (canPulse(owner)) {
          if (time < ic.time()) {
            //Send the message
            delete getStable().messageRegistry[address][x];
            sendPulse(address, func, args, owner);
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
