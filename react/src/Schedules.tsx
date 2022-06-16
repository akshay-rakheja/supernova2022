import { Principal } from "@dfinity/principal";
import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import { useEffect, useState, useCallback } from "react";
import { useTitle } from "./Main";
import { usePlug } from "./PlugProvider";
import useHeartbeat from "./useHeartbeat";
import { UpdateInfo } from "./declarations/heartbeat/heartbeat.did";
import { ClockIcon } from "@heroicons/react/outline";
const ns_to_ms = BigInt(1_000_000);
/** period: Opt<nat>;
  func: string;
  schedule: Opt<Schedule>;
  canister: Principal; */
// type Schedule = {
//   dom?: number;
//   month?: number;
//   dow?: number;
//   hour: number;
//   minute: number;
// };
// type UpdateInfo = {
//   canister: Principal;
//   period?: BigInt;
//   schedule?: Schedule;
//   func: string;
// };
const schedules = [
  {
    canister: "xxxx-yyyyy-zzzzzz",
    period: 12,
    schedule: undefined,
    func: "Remote",
  },
];

export function Canisters() {
  const [_, setTitle] = useTitle();
  useEffect(() => {
    setTitle("My Schedules");
  }, [setTitle]);
  const heartbeat = useHeartbeat();
  const { principal } = usePlug();
  const [schedules, setSchedules] = useState<(UpdateInfo | undefined)[]>([]);
  const getSchedules = useCallback(async () => {
    if (!heartbeat) return;
    const updates = await heartbeat?.get_all();
    if (updates && updates.length) {
      setSchedules(updates);
    } else {
      const count = await heartbeat?.get_count();
      const newUpdates: (UpdateInfo | undefined)[] = [];
      for (var x = 0; x < count; x++) {
        try {
          let newRecord = await heartbeat?.get_one(x);
          newUpdates.push(newRecord);
        } catch (e) {
          newUpdates.push(undefined);
        }
      }
      setSchedules(newUpdates);
      console.log("Hi there let's ahve some new schedules please", updates);
    }
  }, [heartbeat, setSchedules]);
  const removeSchedule = useCallback(
    async (index: number) => {
      await heartbeat?.remove(index);
      // setSchedules((old) => {
      //   old[index] = null;
      //   return [...old];
      // });
      await getSchedules();
    },
    [getSchedules, heartbeat]
  );
  useEffect(() => {
    getSchedules();
  }, [heartbeat]);
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md ">
      {heartbeat && (
        <button
          className="rounded-lg bg-blue-500 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={async () => {
            try {
              console.log("I am starting to look at heartbeat");
              console.log(principal?.toString());
              const pulses = await heartbeat.get_pulses();
              console.log("My pulse balance", pulses);
              console.log(await (await heartbeat.whoami()).toString());
              console.log(await heartbeat.get_count());
              const ret = await heartbeat.get_all();
              for (let index = 0; index < ret.length; index++) {
                const period = ret[index];
                const canisterAddress = period.canister.toString();
                const nexttimens = await heartbeat.get_next_update_time(index);
                const nexttime = new Date(Number(nexttimens / ns_to_ms));

                const principalMe = period.owner.toString();
                console.log({
                  nexttime: nexttime.toLocaleString(),
                  canisterAddress,
                  principalMe,
                  period,
                });
              }
            } catch (e) {
              console.log("That was not so good", e);
            }
          }}
        >
          Test Button
        </button>
      )}
      {heartbeat && (
        <button
          className="rounded-lg bg-blue-500 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={async () => {
            const pulses = await heartbeat.get_pulses();
            if (!pulses) throw new Error("You need pulses to schedule");
            const ret = await heartbeat.add_period(
              Principal.fromText("tzq7c-xqaaa-aaaaa-aaamq-cai"),
              BigInt(20),
              "tick2"
            );
            console.log("scheduled a trigger", ret);
            getSchedules();
          }}
        >
          Create Period
        </button>
      )}
      {heartbeat && (
        <button
          className="rounded-lg bg-blue-500 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={async () => {
            const ret = await heartbeat.mint_pulses(BigInt(1_000_000_000));
            const ret2 = await heartbeat.get_pulses();
            console.log("new pulse balance", ret2);
          }}
        >
          Buy 1 beeellion pulses
        </button>
      )}
      <ul role="list" className="divide-y divide-gray-200">
        {schedules.map((updateInfo, index) => {
          if (!updateInfo) return null;
          const { canister, func, period, schedule } = updateInfo;
          return (
            <li key={index}>
              <div className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {canister.toString()}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {func}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      {period && (
                        <p className="flex items-center text-sm text-gray-500">
                          <ClockIcon
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          Send every {Number(period)} seconds
                        </p>
                      )}
                      {/* <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <LocationMarkerIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      {position.location}
                    </p> */}
                    </div>
                    {/* <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <CalendarIcon
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <p>
                      Closing on{" "}
                      <time dateTime={position.closeDate}>
                        {position.closeDateFull}
                      </time>
                    </p>
                  </div> */}
                    <div>
                      <button
                        onClick={() => {
                          removeSchedule(index);
                        }}
                        className={
                          "bg-red-500 hover:bg-red-900 transition duration-250 text-white p-2 rounded-md"
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default Canisters;
