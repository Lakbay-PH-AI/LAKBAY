import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
console.log(readFileSync(join(here, "..", "db", "schema.sql"), "utf8"));
