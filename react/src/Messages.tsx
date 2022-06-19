import { Principal } from "@dfinity/principal";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useTitle } from "./Main";
import { usePlug } from "@raydeck/useplug";
import useHeartbeat from "./useHeartbeat";
import { Message } from "./declarations/heartbeat/heartbeat.did";
import { ClockIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import AddMessage from "./AddMessage";
import { toast } from "react-toastify";
import ModalMD from "./ModalMD";
import raw from "raw.macro";
const ns_to_ms = BigInt(1_000_000);
const ns_to_s = BigInt(1_000_000_000);
const markdown = raw("./messages.md");
export function Messages() {
  const [title, setTitle] = useTitle();
  useEffect(() => {
    setTitle("My Messages");
  }, [setTitle]);
  const heartbeat = useHeartbeat();
  const [messages, setMessages] = useState<(Message | undefined)[]>([]);
  const [loading, setLoading] = useState(true);
  const getMessages = useCallback(async () => {
    if (!heartbeat) return;
    setLoading(true);
    const updates = await heartbeat?.get_messages();
    if (updates && updates.length) {
      setMessages(updates);
    } else {
      const count = await heartbeat?.get_message_count();
      const newUpdates: (Message | undefined)[] = [];
      for (var x = 0; x < count; x++) {
        try {
          let newRecord = await heartbeat?.get_one_message(x);
          newUpdates.push(newRecord);
        } catch (e) {
          newUpdates.push(undefined);
        }
      }
      setMessages(newUpdates);
    }
    setLoading(false);
  }, [heartbeat, setMessages]);
  const removeMessage = useCallback(
    async (index: number) => {
      setLoading(true);
      try {
        await heartbeat?.remove_message(index);
        toast(`Removed Schedule`, {
          type: "success",
        });

        await getMessages();
      } catch (e) {
        setLoading(false);
      }
    },
    [getMessages, heartbeat]
  );
  useEffect(() => {
    getMessages();
  }, [heartbeat]);
  useEffect(() => {
    setTitle("My Messages: " + messages.length);
  }, [messages, setTitle]);
  const [showAddMessage, setShowAddMessage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const showMessages = !showAddMessage;
  return (
    <div className=" overflow-hidden sm:rounded-md ">
      <button
        onClick={() => setShowHelp(true)}
        className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
      >
        <QuestionMarkCircleIcon className="h-6 w-6 text-white mr-2 inline" />{" "}
        Help
      </button>

      {(showMessages || showAddMessage) && (
        <button
          className="rounded-lg bg-blue-500 dark:bg-blue-800 dark:bg-opacity-80 text-white p-2 m-2 hover:bg-blue-800 transition"
          onClick={() => {
            setShowAddMessage((old) => !old);
          }}
        >
          {showAddMessage ? "Hide Form" : "Add A One-Time Message"}
        </button>
      )}

      {showAddMessage && (
        <AddMessage
          onCancel={() => {
            setShowAddMessage(false);
          }}
          onSubmit={async ({ canister, func, time }) => {
            console.log("Starting to send the period info from values");
            await heartbeat?.add_message(
              Principal.fromText(canister),
              BigInt(time.valueOf()) * ns_to_ms,
              func,
              []
            );
            toast("Scheduled new message", { type: "success" });
            setShowAddMessage(false);
            getMessages();
          }}
        />
      )}

      {showMessages && (
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
                          <div className="h-2 bg-slate-700 rounded w-60" />
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
                            <div className="h-2 bg-slate-700 rounded w-40" />
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
                          <div className="h-2 bg-slate-700 rounded w-60" />
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
                            <div className="h-2 bg-slate-700 rounded w-40" />
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
                {messages.length
                  ? "My Messages"
                  : "No Messages Scheduled - Yet!"}
              </h3>
              <ul role="list" className="divide-y divide-gray-200">
                {messages.map((message, index) => {
                  if (!message) return null;
                  const { canister, func, time } = message;
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
                              <p className="flex items-center text-sm text-gray-500">
                                <ClockIcon
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                Send at{" "}
                                {(() => {
                                  console.log("Time is ", time);
                                  const ms = Number(time / BigInt(ns_to_ms));
                                  console.log("ms is ", ms);
                                  return null;
                                })()}
                                {DateTime.fromMillis(
                                  Number(time / BigInt(ns_to_ms))
                                ).toLocaleString(DateTime.DATETIME_FULL)}
                              </p>

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
                                  removeMessage(index);
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
export default Messages;
