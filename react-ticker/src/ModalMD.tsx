import { FC, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import { XCircleIcon } from "@heroicons/react/outline";
export const ModalMD: FC<{
  markdown: string;
  show: boolean;
  setShow: (show: boolean) => void;
}> = ({ show, setShow, markdown }) => {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        onClose={() => {
          console.log("I iz closing");
          // setIsOpen(false);
        }}
        className="absolute z-50"
      >
        <div className="fixed inset-0 bg-black/80">
          <div className="absolute w-full flex justify-end p-4">
            <XCircleIcon className="h-12 w-12 text-gray-600 hover:text-gray-200 transition" />
          </div>
        </div>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-1000"
          enterFrom="opacity-0"
          enterTo="opacity-80 "
          leave="ease-in duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            onClick={() => {
              console.log("I iz closing 2");
              setShow(false);
            }}
            className={"fixed inset-0 flex items-center justify-center p-4"}
          >
            <Dialog.Panel className="flex-row justify-around flex max-h-screen ">
              <article className="prose dark:prose-invert p-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-black bg-opacity-40 m-4 rounded-lg max-h-full  overflow-scroll border-gray-300 shadow-md dark:border-gray-600 border-opacity-40 border-2">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </article>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
export default ModalMD;
