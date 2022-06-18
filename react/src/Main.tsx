import { usePlug } from "@raydeck/useplug";
import { _SERVICE } from "./declarations/ticker1.did.js";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import useHeartbeat from "./useHeartbeat";
import { Link, Outlet, useResolvedPath } from "react-router-dom";
import Logo from "./assets/icon.png";
import { createContext, useContext, useRef } from "react";
import { getNodeMajorVersion, isTemplateExpression } from "typescript";
import ReactMarkdown from "react-markdown";
const context = createContext({
  title: "UNTITLED",
  setTitle: (title: string) => {},
});
const { Provider } = context;

export const useTitle = (): [string, (title: string) => void] => {
  const { title, setTitle } = useContext(context);
  return [title, setTitle];
};
export default function Main() {
  const { logout, principal } = usePlug();
  const heartbeat = useHeartbeat();
  const [pulses, setPulses] = useState<BigInt>(BigInt(0));
  const intervalRef = useRef<NodeJS.Timer>();
  useEffect(() => {
    (async () => {
      const pulses = await heartbeat?.myBalance();
      setPulses(pulses || BigInt(0));
    })();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const pulses = await heartbeat?.myBalance();
      setPulses(pulses || BigInt(0));
    }, 2000);
  }, [heartbeat]);
  const user = {
    name: principal && principal.toString(),
    email: "",
    imageUrl: Logo,
  };
  const path = useResolvedPath(window.location);
  console.log("path is ", path);
  const navigation = [
    {
      name: "Schedules",
      href: "/schedules",
      current: path.pathname.startsWith("/schedules"),
    },
    {
      name: "Messages",
      href: "/messages",
      current: path.pathname.startsWith("/messages"),
    },
    {
      name:
        "Pulses (Account: " + (Number(pulses) / 10_000_000).toFixed(7) + ")",
      href: "/pulses",
      current: path.pathname.startsWith("/pulses"),
    },
  ];
  const userNavigation = [
    // {
    //   name: "Your Profile",
    //   href: "#",
    //   onClick: () => {
    //     console.log("Clicked your profile");
    //   },
    // },
    // {
    //   name: "Settings",
    //   href: "/",
    //   onClick: () => {
    //     console.log("Clicked settingsofile");
    //   },
    // },
    {
      name: "Sign out",
      href: "#",
      onClick: () => {
        console.log("Clicked sign out");
        window.location.href = "/";
        setTimeout(() => {
          logout();
        }, 500);
      },
    },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }
  const [title, setTitle] = useState("UNTITLED");
  const value = useMemo(() => {
    return {
      title,
      setTitle,
    };
  }, [title, setTitle]);

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full bg-gradient-to-r from-yellow-600 to-blue-800">
        <div className="bg-black bg-opacity-40 pb-12 mb-20 shadow">
          <Disclosure as="nav" className="bg-black ">
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                  <div className="">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Link to="/">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={Logo}
                              alt="DeTi"
                            />
                          </Link>
                        </div>
                        <div className="hidden md:block">
                          <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => (
                              // item.onClick ? (
                              //   <button
                              //     onClick={item.onClick}
                              //     className={classNames(
                              //       item.current
                              //         ? "bg-gray-900 text-white"
                              //         : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              //       "px-3 py-2 rounded-md text-sm font-medium"
                              //     )}
                              //   >
                              //     {item.name}
                              //   </button>
                              // ) :
                              <Link
                                key={item.name}
                                to={item.href}
                                className={classNames(
                                  item.current
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                  "px-3 py-2 rounded-md text-sm font-medium"
                                )}
                                aria-current={item.current ? "page" : undefined}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                          {/* <button
                            type="button"
                            className="bg-gray-800 p-1 text-gray-400 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                          >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                          </button> */}

                          {/* Profile dropdown */}
                          <Menu as="div" className="ml-3 relative">
                            <div>
                              <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="sr-only">Open user menu</span>
                                <span className="p-2 text-white">
                                  {(principal?.toString() || "").substring(
                                    0,
                                    5
                                  ) + "..."}
                                </span>
                              </Menu.Button>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {userNavigation.map((item) => (
                                  <Menu.Item key={item.name}>
                                    {({ active }) => (
                                      <Link
                                        to={item.href}
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "block px-4 py-2 text-sm text-gray-700"
                                        )}
                                        onClick={item.onClick}
                                      >
                                        {item.name}
                                      </Link>
                                    )}
                                  </Menu.Item>
                                ))}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                      <div className="-mr-2 flex md:hidden">
                        {/* Mobile menu button */}
                        <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <span className="sr-only">Open main menu</span>
                          {open ? (
                            <XIcon
                              className="block h-6 w-6"
                              aria-hidden="true"
                            />
                          ) : (
                            <MenuIcon
                              className="block h-6 w-6"
                              aria-hidden="true"
                            />
                          )}
                        </Disclosure.Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="border-b border-gray-700 md:hidden">
                  <div className="px-2 py-3 space-y-1 sm:px-3">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block px-3 py-2 rounded-md text-base font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        <Link to={item.href}>{item.name}</Link>
                      </Disclosure.Button>
                    ))}
                  </div>
                  <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="flex items-center px-5">
                      {/* <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.imageUrl}
                          alt=""
                        />
                      </div> */}
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">
                          User:{" "}
                          {user.name ? user.name.substring(0, 25) + "..." : ""}
                        </div>
                      </div>
                      {/* <button
                        type="button"
                        className="ml-auto bg-gray-800 flex-shrink-0 p-1 text-gray-400 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button> */}
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={item.onClick}
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <header className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            {/* Replace with your content */}
            <div className="bg-white dark:bg-black dark:bg-opacity-70 rounded-lg shadow px-5 py-6 sm:px-6">
              <Provider value={value}>
                <Outlet />
              </Provider>
            </div>
            {/* /End replace */}
          </div>
        </main>
      </div>
    </>
  );
}
