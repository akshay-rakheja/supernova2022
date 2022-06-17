import { Field, Form, Formik, ErrorMessage } from "formik";
import { Principal } from "@dfinity/principal";
import React, { FC, Fragment, useRef } from "react";
import { DateTime } from "luxon";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import "react-datepicker/dist/react-datepicker.css";
export const AddMessage: FC<{
  onSubmit: (args: { canister: string; time: Date; func: string }) => void;
  onCancel: () => void;
}> = ({ onCancel, onSubmit }) => {
  const timeRef = useRef();

  return (
    <Formik
      initialValues={{
        canister: "",
        time: Date.now(),
        func: "",
      }}
      onSubmit={async ({ time, func, canister }) => {
        onSubmit({ func, canister, time: new Date(time) });
      }}
      validate={(values) => {
        const ret = {} as {
          canister?: string;
          func?: string;
          time?: string;
        };

        try {
          Principal.fromText(values.canister);
        } catch (e) {
          ret.canister = "Not a valid principal";
        }
        const date = DateTime.fromMillis(values.time);
        console.log("Checking date", date.toString());
        if (date.diff(DateTime.now()).toMillis() < 0) {
          ret.time = "Scheduled Date/time must be in the future";
        }
        if (values.func.length < 1) ret.func = "Function is required";
        if (/\s/.test(values.func))
          ret.func = "Function must not contain whitespace";
        if (Object.values(ret).some(Boolean)) {
          console.log("Returining", ret);
          return ret;
        }
      }}
    >
      {({ values, isSubmitting, errors, dirty, setFieldValue, isValid }) => (
        <Form>
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Define a Date and Time to send Message
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300"></p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="canister"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Canister ID
                  </label>
                  <div className="mb-4">
                    <Field
                      name="canister"
                      type="text"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="canister"
                      className="p-2 text-red-500 dark:text-red-200 text-xs"
                    />
                  </div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Date and Time for this message to fire (shown in your local
                    time)
                  </label>
                  <div className="mb-4">
                    <div className={"md:flex flex-row justify-start gap-x-2"}>
                      <div className="mb-2">
                        <DatePicker
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          selected={new Date(values.time)}
                          onChange={(newdate) => {
                            if (!newdate) return;
                            const shortTime = DateTime.fromMillis(
                              values.time
                            ).toFormat("h:m");
                            const shortDate =
                              DateTime.fromJSDate(newdate).toFormat("y-M-d");
                            const datetime = `${shortDate} ${shortTime}`;
                            setFieldValue(
                              "time",
                              DateTime.fromFormat(
                                datetime,
                                "y-M-d h:m"
                              ).toMillis(),
                              true
                            );
                          }}
                        />
                      </div>
                      <div>
                        <TimePicker
                          className="h-8 text-md font-medium text-gray-600 dark: text-gray-100"
                          value={new Date(values.time)}
                          onChange={(newTime) => {
                            const dateString =
                              DateTime.fromMillis(values.time).toFormat(
                                "y-M-d"
                              ) +
                              " " +
                              newTime;
                            const date = new Date(dateString);
                            console.log(
                              "many things",
                              dateString,
                              date,
                              date.toLocaleString()
                            );

                            setFieldValue("time", date.valueOf(), true);
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-medium dark:text-white">
                      {DateTime.fromMillis(values.time)
                        //   .setZone("GMT")
                        .toLocaleString(DateTime.DATETIME_FULL)}
                    </p>
                    <Field
                      name="time"
                      type="number"
                      ref={timeRef}
                      className="dark:bg-transparent dark:text-white hidden shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="time"
                      className="p-2 text-red-500 dark:text-red-200 text-xs"
                    />
                  </div>

                  <label
                    htmlFor="func"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Function to call on canister
                  </label>
                  <div className="mb-4">
                    <Field
                      name="func"
                      type="text"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="func"
                      className="p-2 text-red-500 dark:text-red-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!dirty || !isValid || isSubmitting}
                className={[
                  "ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                  (!dirty || !isValid || isSubmitting) && " bg-gray-500",
                ].join(" ")}
              >
                Submit
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default AddMessage;
