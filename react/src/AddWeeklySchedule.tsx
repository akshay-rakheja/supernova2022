import { Field, Form, Formik, ErrorMessage } from "formik";
import { Principal } from "@dfinity/principal";
import React, { FC, Fragment } from "react";
import { NumberLiteralType } from "typescript";
import TimePicker from "react-time-picker";
import { DateTime } from "luxon";

export const AddWeeklySchedule: FC<{
  onSubmit: (args: {
    canister: string;
    dow: number;
    hour: number;
    minute: number;
    func: string;
  }) => void;
  onCancel: () => void;
}> = ({ onCancel, onSubmit }) => {
  return (
    <Formik
      initialValues={{
        canister: "",
        hour: 0,
        minute: 0,
        func: "",
        dow: 0,
      }}
      onSubmit={async (values) => {
        onSubmit(values);
      }}
      validate={(values) => {
        const ret = {} as {
          canister?: string;
          func?: string;
          hour?: string;
          minute?: string;
          dow?: string;
        };

        try {
          Principal.fromText(values.canister);
        } catch (e) {
          ret.canister = "Not a valid principal";
        }
        if (
          values.hour < 0 ||
          values.hour > 23 ||
          values.hour !== Math.floor(values.hour)
        ) {
          ret.hour =
            "Hour must be an integer between 0 (Midnight) and 23 (11pm)";
        }
        if (
          values.minute < 0 ||
          values.minute > 59 ||
          values.minute !== Math.floor(values.minute)
        ) {
          ret.minute = "Minute must be an integer between 0 and 59";
        }
        if (
          values.dow < 0 ||
          values.dow > 6 ||
          values.dow !== Math.floor(values.dow)
        ) {
          ret.dow =
            "Day of week must be an integer between 0 (Sunday) and 6 (Saturday) ";
        }

        if (values.func.length < 1) ret.func = "Function is required";
        if (/\s/.test(values.func))
          ret.func = "Function must not contain whitespace";

        if (Object.values(ret).some(Boolean)) {
          return ret;
        }
      }}
    >
      {({ values, setFieldValue, isValid, isSubmitting }) => (
        <Form>
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Define a Weekly schedule
                </h3>
                <p className="mt-1 text-sm text-gray-500"></p>
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
                      className="dark:bg-transparent dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      autoFocus
                    />
                    <ErrorMessage
                      component="div"
                      name="canister"
                      className="p-2 text-red-500 font-xs"
                    />
                  </div>
                  <label
                    htmlFor="dow"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Day of Week on which to deliver
                  </label>
                  <div className="mb-4">
                    <Field
                      name="dow"
                      type="number"
                      className="dark:bg-transparent dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="dow"
                      className="p-2 text-red-500 font-xs"
                    />
                  </div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Date and Time for this message to fire (shown in UTC/GMT
                    time)
                  </label>
                  <div className="mb-4">
                    <div className={"md:flex flex-row justify-start gap-x-2"}>
                      <div>
                        <TimePicker
                          className="h-8 text-md font-medium text-gray-600 dark: text-gray-100"
                          value={DateTime.fromFormat(
                            values.hour + ":" + values.minute,
                            "h:m"
                          ).toJSDate()}
                          onChange={(newTime) => {
                            console.log(newTime);
                            const new_hour = newTime.toString().split(":")[0];
                            const new_minute = newTime.toString().split(":")[1];
                            console.log(new_hour);
                            console.log(new_minute);

                            const new_hour_int = parseInt(new_hour);
                            const new_minute_int = parseInt(new_minute);
                            console.log(new_hour_int);
                            setFieldValue("hour", new_hour_int, true);
                            setFieldValue("minute", new_minute_int, true);
                          }}
                        />
                      </div>
                    </div>
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
                      className="dark:bg-transparent dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="func"
                      className="p-2 text-red-500 font-xs"
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
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
export default AddWeeklySchedule;
