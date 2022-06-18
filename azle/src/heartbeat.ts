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
  PreUpgrade,
  PostUpgrade,
  Variant,
} from "azle";
import { Ledger } from "azle/canisters/ledger";

//#region custom types
type Mapping<T> = { [key: string]: T };
type Registry = Mapping<UpdateInfo[]>;
type MessageRegistry = Mapping<Message[]>;
type PulseLedger = Mapping<nat>;
type LastUpdateRegistry = Mapping<nat[]>;
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
type RegistryListItem = {
  key: string;
  value: UpdateInfo[];
};
type MessageRegistryListItem = {
  key: string;
  value: Message[];
};
type NatWrapper = { num: nat };
type LastUpdatedListItem = { key: string; value: nat[] };
type PulseLedgerListItem = { key: string; value: nat };
type AllowedPulsesListItem = { key: string; value: nat };
type BurnedPulsesListItem = { key: string; value: nat };
type StableLists = {
  registryList: RegistryListItem[];
  messageRegistryList: MessageRegistryListItem[];
  allowedPulsesList: AllowedPulsesListItem[];
  pulseLedgerList: PulseLedgerListItem[];
  burnedPulsesList: BurnedPulsesListItem[];
  lastUpdatedList: LastUpdatedListItem[];
};
type StableStore = Stable<{
  owner: Principal;
  pulse_price: nat;
  check_price_in_pulses: nat;
  pulse_price_in_pulses: nat;
  accountId: string;
  period: nat;
  totalMessages: Opt<nat>;
  totalHeartbeats: Opt<nat>;
  totalPulses: Opt<nat>;
  totalBurnedPulses: Opt<nat>;
  upgradeLists: StableLists;
  transactions: TxRecord[];
}>;

function getStableLists() {
  const newLists = ic.stableStorage<StableStore>().upgradeLists;
  if (newLists !== null) return newLists;
  else
    return {
      allowedPulsesList: [],
      burnedPulsesList: [],
      lastUpdatedList: [],
      messageRegistryList: [],
      pulseLedgerList: [],
      registryList: [],
    } as StableLists;
}

function setStableLists(newLists: StableLists) {
  getStable().upgradeLists = newLists;
}

function clearStableLists() {
  getStable().upgradeLists = {
    allowedPulsesList: [],
    burnedPulsesList: [],
    lastUpdatedList: [],
    messageRegistryList: [],
    pulseLedgerList: [],
    registryList: [],
  };
}

function getStable() {
  return ic.stableStorage<StableStore>();
}

let registry: Registry = {};
let messageRegistry: MessageRegistry = {};
let allowedPulses: PulseLedger = {};
let burnedPulses: PulseLedger = {};
let pulseLedger: PulseLedger = {};
let lastUpdate: LastUpdateRegistry = {};

export function preUpgrade(): PreUpgrade {
  let keys: string[];
  clearStableLists();
  const lists = getStableLists();

  if (registry) {
    keys = Object.keys(registry);
    lists.registryList = keys.map((key) => ({
      key,
      value: registry[key],
    }));
  } else lists.registryList = [];
  const r = lists.registryList;

  if (messageRegistry) {
    keys = Object.keys(messageRegistry);
    lists.messageRegistryList = keys.map((key) => ({
      key,
      value: messageRegistry[key],
    }));
  }
  if (burnedPulses) {
    keys = Object.keys(burnedPulses);
    lists.burnedPulsesList = keys.map((key) => ({
      key,
      value: burnedPulses[key],
    }));
  }
  if (allowedPulses) {
    keys = Object.keys(allowedPulses);
    lists.allowedPulsesList = keys.map((key) => ({
      key,
      value: allowedPulses[key],
    }));
  }
  if (pulseLedger) {
    keys = Object.keys(pulseLedger);
    lists.pulseLedgerList = keys.map((key) => ({
      key,
      value: pulseLedger[key],
    }));
  }
  if (lastUpdate) {
    keys = Object.keys(lastUpdate);
    lists.lastUpdatedList = keys.map((key) => ({
      key,
      value: lastUpdate[key],
    }));
  }
  setStableLists(lists);
}

export function postUpgrade(): PostUpgrade {
  console.log("Starting postupgrade");
  const lists = getStableLists();
  if (lists.registryList) {
    for (let index of lists.registryList!) {
      registry[index.key] = index.value;
    }
  }
  console.log("Done with registrylist");
  if (lists.messageRegistryList !== null) {
    for (let index of lists.messageRegistryList!) {
      messageRegistry[index.key] = index.value;
    }
  }
  if (lists.lastUpdatedList) {
    for (let index of lists.lastUpdatedList) {
      lastUpdate[index.key] = index.value;
    }
  }
  if (lists.burnedPulsesList) {
    for (let index of lists.burnedPulsesList) {
      burnedPulses[index.key] = index.value;
    }
  }
  if (lists.allowedPulsesList) {
    for (let index of lists.allowedPulsesList) {
      allowedPulses[index.key] = index.value;
    }
  }
  if (lists.pulseLedgerList) {
    for (let index of lists.pulseLedgerList) {
      pulseLedger[index.key] = index.value;
    }
  }
  if (!getStable().totalBurnedPulses) getStable().totalBurnedPulses = 0n;
  if (!getStable().totalHeartbeats) getStable().totalHeartbeats = 0n;
  if (!getStable().totalMessages) getStable().totalMessages = 0n;
  if (!getStable().totalPulses) getStable().totalPulses = 0n;
  clearStableLists();
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
  return should(getStable().period, lastTime);
}

function should(period: nat, comparison: nat): boolean {
  let now = ic.time();
  let delta = (now - comparison) / BigInt(second_in_ns);
  return delta > period;
}

function availablePulses(owner: Principal) {
  return allowedPulses[owner] - burnedPulses[owner];
}
function canPulse(owner: Principal) {
  return availablePulses(owner) > getStable().pulse_price_in_pulses;
}
function canCheck(owner: Principal) {
  return availablePulses(owner) > getStable().check_price_in_pulses;
}

function burn_pulses(owner: Principal, pulses: bigint) {
  burnedPulses[owner] += pulses;
  if (!getStable().totalBurnedPulses) getStable().totalBurnedPulses = 0n;
  getStable().totalBurnedPulses! += pulses;
}

function* sendPulse(
  address: Principal,
  func: string,
  args: Opt<nat8[]>,
  owner: Principal
) {
  burn_pulses(owner, getStable().pulse_price_in_pulses);
  if (!getStable().totalMessages) getStable().totalMessages = 0n;
  getStable().totalMessages!++;
  if (!args) args = [68, 73, 68, 76, 0, 0]; // DIDL + 2 nulls
  console.log("Will tick to ", address, func);
  try {
    yield ic.call_raw(address, func, args, 0n); //@TODO RHD SUpport passing an argument other than null
  } catch (e) {
    console.log("That call did not work for us");
  }
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
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  if (period_in_seconds < 10) throw new Error("Period must be at least 10s");
  if (!registry[owner]) registry[owner] = [];
  registry[owner].push({
    owner,
    period: period_in_seconds,
    func,
    canister,
    schedule: null,
    args: null,
  });
  if (!lastUpdate[owner]) lastUpdate[owner] = [];
  lastUpdate[owner].push(ic.time());
  return lastUpdate[owner].length - 1;
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
  const schedule: Schedule = {
    dow: day_of_week,
    hour: hour_of_day,
    minute,
    dom: null,
    month: null,
  };
  if (!registry[owner]) registry[owner] = [];
  registry[owner].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[owner]) lastUpdate[owner] = [];
  lastUpdate[owner].push(setNextUpdate(schedule));
  return lastUpdate[owner].length - 1;
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
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: null,
    month: null,
  };
  if (!registry[owner]) registry[owner] = [];
  registry[owner].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[owner]) lastUpdate[owner] = [];
  lastUpdate[owner].push(setNextUpdate(schedule));
  return lastUpdate[owner].length - 1;
}

export function add_monthly_schedule(
  canister: Principal,
  hour_of_day: nat8,
  minute: nat8,
  day_of_month: nat8,
  func: string
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: day_of_month,
    month: null,
  };
  if (!registry[owner]) registry[owner] = [];
  registry[owner].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[owner]) lastUpdate[owner] = [];
  lastUpdate[owner].push(setNextUpdate(schedule));
  return lastUpdate[owner].length - 1;
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
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const schedule: Schedule = {
    dow: null,
    hour: hour_of_day,
    minute,
    dom: day_of_month,
    month,
  };
  if (!registry[owner]) registry[owner] = [];
  registry[owner].push({
    owner,
    func,
    canister,
    schedule,
    period: null,
    args: null,
  });
  if (!lastUpdate[owner]) lastUpdate[owner] = [];
  lastUpdate[owner].push(setNextUpdate(schedule));
  return lastUpdate[owner].length - 1;
}

export function remove(index: nat32): Update<void> {
  const owner = ic.caller();
  if (registry[owner] && registry[owner].length > index) {
    const newRegistry: UpdateInfo[] = [];
    for (let x = 0; x < registry[owner].length; x++) {
      if (x !== index) {
        newRegistry.push(registry[owner][x]);
      }
    }
    registry[owner] = newRegistry;
  }
}

export function get_one(index: nat32): Query<UpdateInfo> {
  const owner = ic.caller();
  return registry[owner][index];
}

export function get_count(): Query<nat32> {
  const owner = ic.caller();
  if (registry[owner]) {
    return registry[owner].length;
  } else return 0;
}

export function get_all(): Query<UpdateInfo[]> {
  const owner = ic.caller();
  if (registry[owner]) return registry[owner];
  else return [];
}

export function get_next_update_time(index: nat32): Query<nat> {
  const owner = ic.caller();
  if (registry[owner][index].period !== null) {
    return lastUpdate[owner][index] + registry[owner][index].period!;
  } else {
    return lastUpdate[owner][index];
  }
}
//#endregion

//#region Interface for messages (one-time events)
export function add_message(
  canister: Principal,
  unix_time_code_in_ns: nat,
  func: string,
  args: Opt<nat8[]>
): Update<nat32> {
  const owner = ic.caller();
  if (allowedPulses[owner] < 1)
    throw new Error("You must have pulses in the bank");
  const time = unix_time_code_in_ns;
  if (time < ic.time()) throw new Error("Time must be in the future");
  if (!messageRegistry[owner]) messageRegistry[owner] = [];
  messageRegistry[owner].push({
    args,
    func,
    canister,
    time,
    owner,
  });
  return messageRegistry[owner].length - 1;
}

export function remove_message(index: nat32): Update<nat32> {
  const owner = ic.caller();
  const newRegistry: Message[] = [];
  if (!messageRegistry[owner]) return 0;
  if (index > messageRegistry[owner].length)
    return messageRegistry[owner].length;
  for (let x = 0; x < messageRegistry[owner].length; x++) {
    if (x != index) {
      newRegistry.push(messageRegistry[owner][index]);
    }
  }
  messageRegistry[owner] = newRegistry;
  return messageRegistry[owner].length;
}

export function get_one_message(index: nat32): Query<Message> {
  const owner = ic.caller();
  return messageRegistry[owner][index];
}

export function get_message_count(): Query<nat32> {
  const owner = ic.caller();
  return messageRegistry[owner].length;
}

export function get_messages(): Query<Message[]> {
  const owner = ic.caller();
  return messageRegistry[owner];
}
//#endregion
let lastTime: nat = 0n;
// #region owner management
export function init(): Init {
  getStable().owner = ic.caller();
  getStable().period = 10n;
  getStable().accountId = "";
  getStable().pulse_price = 1n; // price denominated in e8s (ICP * 1e-8)
  getStable().pulse_price_in_pulses = 1_000_000n; // (0.1 PULSE)
  getStable().check_price_in_pulses = 10n; // (0.00000001 PULSE)
  getStable().totalBurnedPulses = 0n;
  getStable().totalHeartbeats = 0n;
  getStable().totalMessages = 0n;
  getStable().totalPulses = 0n;
  // getStable().registryList = [];
  // getStable().messageRxegistryList = [];
  // getStable().lastUpdateList = [];
  // getStable().allowedPulsesList = [];
  // getStable().pulseLedgerList = [];
  // getStable().burnedPulsesList = [];
  lastTime = ic.time();
  clearStableLists();
  if (!getStable().transactions) getStable().transactions = [] as TxRecord[];
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
  /*
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
  */
  const pulseCount = blockNumber;
  const principal = ic.caller();
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  if (!allowedPulses[principal]) {
    allowedPulses[principal] = 0n;
    burnedPulses[principal] = 0n;
  }
  allowedPulses[principal] += pulseCount;
  if (!getStable().totalPulses) getStable().totalPulses = 0n;
  getStable().totalPulses! += pulseCount;
  return { ok: allowedPulses[principal], err: null };
}

export function mint_pulses_for(
  pulseCount: nat,
  onBehalfOf: Principal
): Update<nat> {
  if (pulseCount < 1) throw new Error("Pulsecount needs ot be at least 1");
  const principal = onBehalfOf;
  if (!allowedPulses[principal]) {
    allowedPulses[principal] = 0n;
    burnedPulses[principal] = 0n;
  }
  allowedPulses[principal] += pulseCount;
  if (!getStable().totalPulses) getStable().totalPulses = 0n;
  getStable().totalPulses! += pulseCount;
  return allowedPulses[principal];
}

export function get_burned_pulses(): Query<nat> {
  const principal = ic.caller();
  return burnedPulses[principal];
}

function _get_pulses(principal: Principal): nat {
  if (allowedPulses[principal]) {
    if (burnedPulses[principal]) {
      return allowedPulses[principal] - burnedPulses[principal];
    } else {
      return allowedPulses[principal];
    }
  } else return 0n;
}

function _transfer_pulses(
  from: Principal,
  to: Principal,
  pulseCount: nat
): nat {
  if (pulseCount > _get_pulses(from)) {
    getStable().transactions.push({
      amount: pulseCount,
      caller: from,
      from,
      to,
      fee: 0n,
      index: BigInt(getStable().transactions.length),
      op: { transfer: null },
      status: { failed: null },
      timestamp: ic.time(),
    });
    return 0n;
  }
  if (!allowedPulses[to]) {
    allowedPulses[to] = 0n;
    burnedPulses[to] = 0n;
  }
  allowedPulses[from] -= pulseCount;
  allowedPulses[to] += pulseCount;
  getStable().transactions.push({
    amount: pulseCount,
    caller: from,
    from,
    to,
    fee: 0n,
    index: BigInt(getStable().transactions.length),
    op: { transfer: null },
    status: { succeeded: null },
    timestamp: ic.time(),
  });
  return pulseCount;
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
  const start = ic.time();
  if (shouldTick()) {
    if (!getStable().totalHeartbeats) getStable().totalHeartbeats = 0n;
    getStable().totalHeartbeats!++;
    lastTime = ic.time();
    for (const owner of Object.keys(registry)) {
      console.log("Looking at owner in registry", owner);
      console.log(
        "Looking at whether I should walk this",
        registry[owner].length
      );
      for (let index = 0; index < registry[owner].length; index++) {
        console.log("Looking at index in registry", index);
        if (registry[owner][index] === null) continue;

        const updateInfo = registry[owner][index];
        const {
          period: thisPeriod,
          schedule,
          func,
          args,
          canister,
        } = updateInfo;
        if (canCheck(owner)) {
          burn_pulses(owner, getStable().check_price_in_pulses);
          if (canPulse(owner)) {
            if (thisPeriod !== null) {
              if (should(thisPeriod, lastUpdate[owner][index])) {
                lastUpdate[owner][index] = start;
                yield* sendPulse(canister, func, args, owner);
              }
            } else if (schedule !== null) {
              if (lastUpdate[owner][index] < ic.time()) {
                const nextUpdate = setNextUpdate(schedule);
                lastUpdate[owner][index] = nextUpdate;
                yield* sendPulse(canister, func, args, owner);
              }
            }
          }
        }
      }
    }

    for (const owner of Object.keys(messageRegistry)) {
      let removeIndexes: nat32[] = [];
      for (let x = messageRegistry[owner].length - 1; x > -1; x--) {
        if (messageRegistry[owner][x] === null) continue;
        const { time, args, canister, func } = messageRegistry[owner][x];
        if (canCheck(owner)) {
          burn_pulses(owner, getStable().check_price_in_pulses);
          if (canPulse(owner)) {
            if (time < ic.time()) {
              removeIndexes.push(x);
              yield* sendPulse(canister, func, args, owner);
            }
          }
        }
      }
      if (removeIndexes.length) {
        const newIndexes: Message[] = [];
        for (let x = messageRegistry[owner].length - 1; x > -1; x--) {
          if (!removeIndexes.includes(x)) {
            newIndexes.push(messageRegistry[owner][x]);
          }
        }
        messageRegistry[owner] = newIndexes;
        removeIndexes = [];
      }
    }
  }
}

export function whoami(): Query<Principal> {
  return ic.caller();
}
//#endregion
/** */

export function get_total_heartbeats(): Query<nat> {
  return getStable().totalHeartbeats || 0n;
}

export function get_total_messages(): Query<nat> {
  return getStable().totalMessages || 0n;
}

export function get_total_burned_pulses(): Query<nat> {
  return getStable().totalBurnedPulses || 0n;
}

export function get_total_pulses(): Query<nat> {
  return getStable().totalPulses || 0n;
}

//#region DIP20

type TxReceipt = Variant<{
  Ok: nat;
  Err: Variant<{
    InsufficientAllowance: null;
    InsufficientBalance: null;
    ErrorOperationStyle: null;
    Unauthorized: null;
    LedgerTrap: null;
    ErrorTo: null;
    Other: string;
    BlockUsed: null;
    AmountTooSmall: null;
  }>;
}>;

export function transfer(to: Principal, value: nat): Update<TxReceipt> {
  const from = ic.caller();
  if (from === to) return { Err: { ErrorTo: null } };
  _transfer_pulses(from, to, value);
  return { Ok: value };
}

// @TODO: Implement this
export function transferFrom(
  from: Principal,
  to: Principal,
  value: nat
): Update<TxReceipt> {
  const owner = ic.caller();
  if (from != owner) return { Err: { Unauthorized: null } };
  if (from === to) return { Err: { ErrorTo: null } };
  _transfer_pulses(from, to, value);
  return { Ok: value };
}

// @TODO: Implement this
export function approve(spender: Principal, value: nat): Update<TxReceipt> {
  return { Err: { ErrorOperationStyle: null } };
}

let logo_string =
  "https://fl5mh-daaaa-aaaap-qalja-cai.raw.ic0.app/static/media/icon.f5b390e3d153e7f2a6c9.png";
export function logo(): Query<string> {
  return logo_string;
}

let name_string = "Pulses";
export function name(): Query<string> {
  return name_string;
}

let symbol_string = "DETI";

export function symbol(): Query<string> {
  return symbol_string;
}

let decimals_number = 8;

export function decimals(): Query<nat8> {
  return decimals_number;
}

export function totalSupply(): Query<nat> {
  return getStable().totalPulses || 0n;
}

export function myBalance(): Query<nat> {
  const who = ic.caller();
  return allowedPulses[who] - burnedPulses[who] || 0n;
}

export function balanceOf(who: Principal): Query<nat> {
  return allowedPulses[who] - burnedPulses[who] || 0n;
}

// @TODO: implement this
export function allowance(owner: Principal, spender: Principal): Query<nat> {
  return 0n;
}

type Metadata = {
  logo: string; // base64 encoded logo or logo url
  name: string; // token name
  symbol: string; // token symbol
  decimals: nat8; // token decimal
  totalSupply: nat; // token total supply
  owner: Principal; // token owner
  fee: nat; // fee for update calls
};

export function getMetadata(): Query<Metadata> {
  const metadata: Metadata = {
    logo: logo_string,
    name: name_string,
    symbol: symbol_string,
    decimals: decimals_number,
    totalSupply: getStable().totalPulses || 0n,
    owner: getStable().owner,
    fee: 0n,
  };
  return metadata;
}

// @TODO: implement this
export function mint(to: Principal, value: nat): Update<TxReceipt> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return { Err: { Unauthorized: null } };
  return { Err: { Other: "We dont do that here!" } };
}

// @TODO: implement this
export function burn(from: Principal, value: nat): Update<TxReceipt> {
  const owner = ic.caller();
  return { Err: { Other: "We dont do that here!" } };
}

export function setName(name: string): Update<void> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return;
  name_string = name;
}

export function setLogo(logo: string): Update<void> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return;
  logo_string = logo;
}

// @TODO: implement this
export function setFee(newFee: nat): Update<void> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return;
  return;
}

// @TODO: implement this
export function setFeeTo(newFeeTo: Principal): Update<void> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return;
  return;
}

export function setOwner(newOwner: Principal): Update<void> {
  const owner = ic.caller();
  if (owner !== getStable().owner) return;
  getStable().owner = newOwner;
}

// @TODO: implement this
export function historySize(): Query<nat> {
  return 0n;
}

type Operation = Variant<{
  approve: null;
  mint: null;
  transfer: null;
  transferFrom: null;
}>;

type TransactionStatus = Variant<{
  succeeded: null;
  failed: null;
}>;

type TxRecord = {
  caller: Principal;
  op: Operation; // operation type
  index: nat; // transaction index
  from: Principal;
  to: Principal;
  amount: nat;
  fee: nat;
  timestamp: nat;
  status: TransactionStatus;
};

export function getTransaction(index: nat): Query<TxRecord> {
  const index32 = Number(index);
  return getStable().transactions[index32];
}

export function getTransactions(start: nat, limit: nat): Query<TxRecord[]> {
  const start32 = Number(start);
  const limit32 = Number(limit);
  const output: TxRecord[] = [];
  const transactions = getStable().transactions;
  for (let x = 0; x < limit32; x++) {
    const index = start32 + x;
    if (x < transactions.length) output.push(transactions[index]);
  }
  return transactions;
}

export function getUserTransactions(
  who: Principal,
  start: nat,
  limit: nat
): Query<TxRecord[]> {
  const start32 = Number(start);
  const limit32 = Number(limit);
  const output: TxRecord[] = [];
  const transactions = getStable().transactions;
  for (let x = 0; x < limit32; x++) {
    const index = start32 + x;
    if (
      (x < transactions.length && transactions[index].from == who) ||
      transactions[index].to == who
    )
      output.push(transactions[index]);
  }
  return transactions;
}

export function getUserTransactionAmount(who: Principal): Query<nat> {
  const transactions = getStable().transactions;
  let output: nat = 0n;
  for (let x = 0; x < transactions.length; x++) {
    const { from, to } = transactions[x];
    if (from == who || to == who) {
      output++;
    }
  }
  return output;
}

//#endregion
