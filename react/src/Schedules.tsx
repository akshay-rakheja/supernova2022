import { Principal } from "@dfinity/principal";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useTitle } from "./Main";
import useHeartbeat from "./useHeartbeat";
import { UpdateInfo } from "./declarations/heartbeat/heartbeat.did";
import { ClockIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";
import AddPeriod from "./AddPeriod";
import AddDailySchedule from "./AddDailySchedule";
import AddWeeklySchedule from "./AddWeeklySchedule";
import AddMonthlySchedule from "./AddMonthlySchedule";
import { toast } from "react-toastify";
import ModalMD from "./ModalMD";
import raw from "raw.macro";
const markdown = raw("./schedules.md");
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const getMonth = (month: number) => {
  return months[month];
};
const dows = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const getDOW = (dow: number) => {
  return dows[dow];
};

export function Canisters() {
  const [_, setTitle] = useTitle();
  useEffect(() => {
    setTitle("My Schedules");
  }, [setTitle]);
  const heartbeat = useHeartbeat();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<(UpdateInfo | undefined)[]>([]);
  const getSchedules = useCallback(async () => {
    if (!heartbeat) return;
    setLoading(true);
    try {
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
      setLoading(false);
    } catch (e) {
      console.log("That was unpleasant");
    }
  }, [heartbeat, setSchedules]);
  const removeSchedule = useCallback(
    async (index: number) => {
      setLoading(true);
      try {
        toast(`Removing Schedule...`, {
          type: "info",
        });
        await heartbeat?.remove(index);
        toast(`Removed Schedule...`, {
          type: "success",
        });

        await getSchedules();
      } catch (e) {
        setLoading(false);
      }
    },
    [getSchedules, heartbeat]
  );
  useEffect(() => {
    getSchedules();
  }, [heartbeat]);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [showAddDailySchedule, setShowAddDailySchedule] = useState(false);
  const [showAddWeeklySchedule, setShowAddWeeklySchedule] = useState(false);
  const [showAddMonthlySchedule, setShowMonthlySchedule] = useState(false);
  useEffect(() => {
    if (showAddDailySchedule) {
      setShowAddPeriod(false);
      setShowAddWeeklySchedule(false);
      setShowMonthlySchedule(false);
    }
  }, [showAddDailySchedule]);
  useEffect(() => {
    if (showAddPeriod) {
      setShowAddDailySchedule(false);
      setShowAddWeeklySchedule(false);
      setShowMonthlySchedule(false);
    }
  }, [showAddPeriod]);
  useEffect(() => {
    if (showAddWeeklySchedule) {
      setShowAddDailySchedule(false);
      setShowAddPeriod(false);
      setShowMonthlySchedule(false);
    }
  }, [showAddWeeklySchedule]);
  useEffect(() => {
    if (showAddMonthlySchedule) {
      setShowAddDailySchedule(false);
      setShowAddPeriod(false);
      setShowAddWeeklySchedule(false);
    }
  }, [showAddMonthlySchedule]);
  const showSchedules =
    !showAddDailySchedule &&
    !showAddPeriod &&
    !showAddWeeklySchedule &&
    !showAddMonthlySchedule;
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="  overflow-hidden sm:rounded-md ">
      <button
        onClick={() => setShowHelp(true)}
        className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
      >
        <QuestionMarkCircleIcon className="h-6 w-6 text-white mr-2 inline-block" />{" "}
        Help
      </button>
      {(showSchedules || showAddPeriod) && (
        <button
          className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={() => {
            setShowAddPeriod((old) => !old);
          }}
        >
          {showAddPeriod ? "Hide Form" : "Add A Periodic Pulse"}
        </button>
      )}
      {(showSchedules || showAddDailySchedule) && (
        <button
          className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={() => {
            setShowAddDailySchedule((old) => !old);
          }}
        >
          {showAddDailySchedule ? "Hide Form" : "Add A Daily Schedule"}
        </button>
      )}
      {(showSchedules || showAddWeeklySchedule) && (
        <button
          className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={() => {
            setShowAddWeeklySchedule((old) => !old);
          }}
        >
          {showAddWeeklySchedule ? "Hide Form" : "Add A Weekly Schedule"}
        </button>
      )}
      {(showSchedules || showAddMonthlySchedule) && (
        <button
          className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={() => {
            setShowMonthlySchedule((old) => !old);
          }}
        >
          {showAddMonthlySchedule ? "Hide Form" : "Add A Monthly Schedule"}
        </button>
      )}
      {showAddPeriod && (
        <AddPeriod
          onCancel={() => {
            setShowAddPeriod(false);
          }}
          onSubmit={async ({ canister, func, period }) => {
            console.log("Starting to send the period info from values");
            toast(`Adding Schedule to ${canister.substring(0, 7)}...`, {
              type: "info",
            });
            await heartbeat?.add_period(
              Principal.fromText(canister),
              BigInt(period),
              func
            );
            console.log("Got the period info from values");
            toast(`Added Schedule to ${canister.substring(0, 7)}...`, {
              type: "success",
            });

            setShowAddPeriod(false);
            getSchedules();
          }}
        />
      )}
      {showAddDailySchedule && (
        <AddDailySchedule
          onCancel={() => {
            setShowAddDailySchedule(false);
          }}
          onSubmit={async (values) => {
            toast(`Adding Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "info",
            });
            await heartbeat?.add_daily_schedule(
              Principal.fromText(values.canister),
              values.hour,
              values.minute,
              values.func
            );
            toast(`Added Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "success",
            });

            setShowAddDailySchedule(false);
            getSchedules();
          }}
        />
      )}
      {showAddWeeklySchedule && (
        <AddWeeklySchedule
          onCancel={() => {
            setShowAddWeeklySchedule(false);
          }}
          onSubmit={async (values) => {
            toast(`Adding Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "info",
            });
            await heartbeat?.add_weekly_schedule(
              Principal.fromText(values.canister),
              values.dow,
              values.hour,
              values.minute,
              values.func
            );
            toast(`Added Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "success",
            });

            setShowAddWeeklySchedule(false);
            getSchedules();
          }}
        />
      )}
      {showAddMonthlySchedule && (
        <AddMonthlySchedule
          onCancel={() => {
            setShowMonthlySchedule(false);
          }}
          onSubmit={async (values) => {
            toast(`Adding Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "info",
            });
            await heartbeat?.add_monthly_schedule(
              Principal.fromText(values.canister),
              values.dom,
              values.hour,
              values.minute,
              values.func
            );
            toast(`Added Schedule to ${values.canister.substring(0, 7)}...`, {
              type: "success",
            });

            setShowMonthlySchedule(false);
            getSchedules();
          }}
        />
      )}
      {showSchedules && (
        <div className="space-y-8 divide-y divide-gray-200 pt-8">
          {loading ? (
            <Fragment>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-80" />
              </h3>
              <ul role="list" className="divide-y divide-gray-200 ">
                <li>
                  <div className="block hover:bg-gray-50 animate-pulse">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          <div className="h-2 bg-slate-700 rounded w-80" />
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <div className="h-2 bg-slate-700 rounded w-20 m-2" />
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            <div className="h-2 bg-slate-700 rounded w-60" />
                          </p>
                        </div>

                        <div></div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="block hover:bg-gray-50 animate-pulse">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          <div className="h-2 bg-slate-700 rounded w-80" />
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <div className="h-2 bg-slate-700 rounded w-20 m-2" />
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            <div className="h-2 bg-slate-700 rounded w-60" />
                          </p>
                        </div>

                        <div></div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </Fragment>
          ) : (
            <Fragment>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                My Scheduled Events
              </h3>
              <ul role="list" className="divide-y divide-gray-200">
                {schedules.map((updateInfo, index) => {
                  if (!updateInfo) return null;
                  const { canister, func, period, schedule } = updateInfo;
                  return (
                    <li key={index}>
                      <div className="block  ">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-100 truncate">
                              {canister.toString()}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                                to function: {func}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              {!!period.length && (
                                <p className="flex items-center text-sm text-gray-500">
                                  <ClockIcon
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  Send every {Number(period)} seconds
                                </p>
                              )}
                              {!!schedule.length &&
                                (schedule[0].month.length ? (
                                  <p className="flex items-center text-sm text-gray-500">
                                    <ClockIcon
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    Yearly on {schedule[0].dom}{" "}
                                    {getMonth(schedule[0].month[0])} at{" "}
                                    {schedule[0].hour}:
                                    {schedule[0].minute
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    GMT
                                  </p>
                                ) : schedule[0].dom.length ? (
                                  <p className="flex items-center text-sm text-gray-500">
                                    <ClockIcon
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    Monthly on day {schedule[0].dom} at{" "}
                                    {schedule[0].hour}:
                                    {schedule[0].minute
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    GMT
                                  </p>
                                ) : schedule[0].dow.length ? (
                                  <p className="flex items-center text-sm text-gray-500">
                                    <ClockIcon
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    Weekly on {getDOW(schedule[0].dow[0])} at{" "}
                                    {schedule[0].hour}:
                                    {schedule[0].minute
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    GMT
                                  </p>
                                ) : (
                                  <p className="flex items-center text-sm text-gray-500">
                                    <ClockIcon
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    Daily at {schedule[0].hour}:
                                    {schedule[0].minute
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    GMT
                                  </p>
                                ))}
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
            </Fragment>
          )}
        </div>
      )}
      <ModalMD show={showHelp} setShow={setShowHelp} markdown={markdown} />
    </div>
  );
}
export default Canisters;
