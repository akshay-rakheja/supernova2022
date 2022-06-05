import { Query, ic , Heartbeat} from "azle";

export function hello_world(): Query<string> {
  return "Hello, World!";
}

export function heartbeat(): Heartbeat {
  console.log("Heartbeat");
}