#!/bin/env ts-node
import {
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
const mode = process.argv[2];
if (!["local", "production"].includes(mode)) {
  console.error("Argument must be local or production");
  process.exit(1);
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
        mode: string;
      }
    >JSON.parse(json);
    obj.mode = mode;
    const newJson = JSON.stringify(obj, null, 2);
    writeFileSync(configPath, newJson);
  }
});
