import { Field, Form, Formik, ErrorMessage } from "formik";
import { Principal } from "@dfinity/principal";
import React, { FC, Fragment } from "react";

export const AddPeriod: FC<{
  onSubmit: (args: { canister: string; period: number; func: string }) => void;
  onCancel: () => void;
}> = ({ onCancel, onSubmit }) => {
  return (
    <Formik
      initialValues={{
        canister: "",
        period: 30,
        func: "",
      }}
      onSubmit={async (values) => {
        onSubmit(values);
      }}
      validate={(values) => {
        const ret = {
          canister: undefined,
          period: undefined,
          func: undefined,
        } as { canister?: string; period?: string; func?: string };

        try {
          Principal.fromText(values.canister);
        } catch (e) {
          ret.canister = "Not a valid principal";
        }
        if (values.period < 10 || values.period % 10 !== 0) {
          ret.period = "Period must be at least 10s and a multiple of 10";
        } else if (values.period !== Math.floor(values.period)) {
          ret.period = "Period must be an integer";
        }
        if (values.func.length < 1) ret.func = "Function is required";
        if (/\s/.test(values.func))
          ret.func = "Function must not contain whitespace";

        if (Object.values(ret).some(Boolean)) {
          return ret;
        }
      }}
    >
      {({ isValid, isSubmitting }) => (
        <Form>
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Define a periodic pulse
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
                    htmlFor="period"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Seconds between each pulse
                  </label>
                  <div className="mb-4">
                    <Field
                      name="period"
                      type="number"
                      className="dark:bg-transparent dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      component="div"
                      name="period"
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
export default AddPeriod;
