#!/bin/env ts-node
import {
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
import { execSync } from "child_process";
const ciPath = join(__dirname, "canister_ids.json");
let production_canisters: Record<string, string>;
if (existsSync(ciPath)) {
  const ciJson = readFileSync(ciPath, "utf-8");
  const ciObj: Record<string, { ic: string }> = JSON.parse(ciJson);
  production_canisters = Object.entries(ciObj).reduce((o, [key, { ic }]) => {
    return { ...o, [key]: ic };
  }, {});
}
const lciPath = join(__dirname, ".dfx", "local", "canister_ids.json");
let local_canisters: Record<string, string>;
if (existsSync(lciPath)) {
  const lciJson = readFileSync(
    join(__dirname, ".dfx", "local", "canister_ids.json"),
    "utf-8"
  );
  let lciObj: { [key: string]: { local: string } } = JSON.parse(lciJson);
  local_canisters = Object.entries(lciObj).reduce((o, [key, { local }]) => {
    return { ...o, [key]: local };
  }, {});
}
//look for my front-ends
const dirs = readdirSync(__dirname).filter(
  (s) => s.startsWith("react") && statSync(join(__dirname, s)).isDirectory
);
dirs.forEach((dir) => {
  const configPath = join(__dirname, dir, "src", "config.json");
  const json = readFileSync(configPath, "utf-8");
  if (json) {
    const obj = <
      {
        production: { canisters: Record<string, string> };
        local: { canisters: Record<string, string> };
      }
    >JSON.parse(json);
    if (production_canisters) obj.production.canisters = production_canisters;
    if (local_canisters) obj.local.canisters = local_canisters;
    const newJson = JSON.stringify(obj, null, 2);
    writeFileSync(configPath, newJson);
    const declarationsPath = join(__dirname, dir, "src", "declarations");
    execSync(`cp -r src/declarations ${declarationsPath}`, {
      stdio: "inherit",
    });
  }
});
