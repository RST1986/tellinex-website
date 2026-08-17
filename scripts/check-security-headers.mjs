import fs from "node:fs";

const fail = (message) => {
  console.error(`security-headers: FAIL — ${message}`);
  process.exit(1);
};

const headers = fs.readFileSync("public/_headers", "utf8");
const cspLine = headers.split("\n").find((line) => line.includes("Content-Security-Policy:"));

if (!cspLine) fail("public/_headers missing Content-Security-Policy");
if (!headers.includes("Strict-Transport-Security:")) fail("public/_headers missing Strict-Transport-Security");
if (!headers.includes("X-Frame-Options: DENY")) fail("public/_headers missing X-Frame-Options: DENY");
if (!headers.includes("X-Content-Type-Options: nosniff")) fail("public/_headers missing X-Content-Type-Options: nosniff");
if (/\*/.test(cspLine)) fail("CSP uses a wildcard host");

for (const token of [
  "https://challenges.cloudflare.com",
  "https://egztpclpcnizcdtfugsv.supabase.co",
  "https://www.googletagmanager.com",
]) {
  if (!cspLine.includes(token)) fail(`CSP missing ${token}`);
}

console.log("security-headers: PASS");
