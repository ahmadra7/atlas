import fs from "fs";

const p = new URL("../packages/api-client/src/mock-data.ts", import.meta.url);
let s = fs.readFileSync(p, "utf8");
s = s.replace("function delay(ms = 40)", "function delay(ms = 0)");
s = s.replace(/await delay\(\d+\)/g, "await delay(0)");
s = s.replace(/w=640&q=55/g, "w=480&q=40&fm=webp");
s = s.replace(/w=1000&q=80/g, "w=480&q=40&fm=webp");
fs.writeFileSync(p, s);
console.log("ok", s.match(/function delay\(ms = \d+\)/)?.[0]);
