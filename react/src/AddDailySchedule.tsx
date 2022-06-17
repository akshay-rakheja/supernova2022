import { Field, Form, Formik, ErrorMessage } from "formik";
import { Principal } from "@dfinity/principal";
import React, { FC, Fragment } from "react";

export const AddDailySchedule: FC<{
  onSubmit: (args: {
    canister: string;
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
        if (values.func.length < 1) ret.func = "Function is required";
        if (/\s/.test(values.func))
          ret.func = "Function must not contain whitespace";

        if (Object.values(ret).some(Boolean)) {
          return ret;
        }
      }}
    >
      <Form>
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Define a periodic pulse
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-200"></p>
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
                    className="p-2 text-red-500 font-xs"
                  />
                </div>
                <label
                  htmlFor="hour"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Hour on which this should run (in UTC/GMT Time Zone)
                </label>
                <div className="mb-4">
                  <Field
                    name="hour"
                    type="number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <ErrorMessage
                    component="div"
                    name="hour"
                    className="p-2 text-red-500 font-xs"
                  />
                </div>
                <label
                  htmlFor="minute"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Minute at which this should run
                </label>
                <div className="mb-4">
                  <Field
                    name="minute"
                    type="number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <ErrorMessage
                    component="div"
                    name="minute"
                    className="p-2 text-red-500 font-xs"
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
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 dark:bg-transparent hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </div>
      </Form>
    </Formik>
  );
};
export default AddDailySchedule;
