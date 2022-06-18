import { Principal } from "@dfinity/principal";

import { useEffect, useState, useCallback } from "react";
import { useTitle } from "./Main";
import { usePlug } from "@raydeck/useplug";
import useHeartbeat from "./useHeartbeat";
import { Message } from "./declarations/heartbeat/heartbeat.did";
import { ClockIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import AddMessage from "./AddMessage";
import { toast } from "react-toastify";
const ns_to_ms = BigInt(1_000_000);
const ns_to_s = BigInt(1_000_000_000);

export function Messages() {
  const [title, setTitle] = useTitle();
  useEffect(() => {
    setTitle("My Messages");
  }, [setTitle]);
  const heartbeat = useHeartbeat();
  const { principal } = usePlug();
  const [messages, setMessages] = useState<(Message | undefined)[]>([]);
  const getMessages = useCallback(async () => {
    if (!heartbeat) return;
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
      console.log("Hi there let's ahve some new messages please", updates);
    }
  }, [heartbeat, setMessages]);
  const removeMessage = useCallback(
    async (index: number) => {
      await heartbeat?.remove_message(index);
      toast(`Removed Schedule`, {
        type: "success",
      });

      await getMessages();
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

  const showMessages = !showAddMessage;
  return (
    <div className=" overflow-hidden sm:rounded-md ">
      {(showMessages || showAddMessage) && (
        <button
          className="rounded-lg bg-blue-500 text-white p-2 m-2 hover:bg-blue-800 transition"
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
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            {messages.length ? "My Messages" : "No Messages Scheduled - Yet!"}
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
        </div>
      )}
    </div>
  );
}
export default Messages;
