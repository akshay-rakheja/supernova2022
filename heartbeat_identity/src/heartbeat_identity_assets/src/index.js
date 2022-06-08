import { heartbeat_identity } from "../../declarations/heartbeat_identity";
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  let authClient;
  authClient = await AuthClient.create();

  const button = e.target.querySelector("button");

  const name = document.getElementById("name").value.toString();

  button.setAttribute("disabled", true);

  // Interact with foo actor, calling the greet method
  const greeting = await heartbeat_identity.greet(name);

  button.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
});
