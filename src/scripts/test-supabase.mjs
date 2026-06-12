import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const frontendEnvPath = path.resolve(process.cwd(), "../vendorside/.env");

const loadEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const raw = fs.readFileSync(envPath, "utf8");

  return raw
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

      acc[key] = value;
      return acc;
    }, {});
};

const frontendEnv = loadEnvFile(frontendEnvPath);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceRoleUrl = process.env.SUPABASE_URL;
const anonUrl = frontendEnv.REACT_APP_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const anonKey = frontendEnv.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!serviceRoleUrl && !anonUrl) {
  console.error("Missing Supabase URL. Set SUPABASE_URL in backend/.env or add REACT_APP_SUPABASE_URL in vendorside/.env.");
  process.exit(1);
}

const isServiceRoleMode = Boolean(serviceRoleUrl && serviceRoleKey);
const client = createClient(
  isServiceRoleMode ? serviceRoleUrl : anonUrl,
  isServiceRoleMode ? serviceRoleKey : anonKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

const printHeader = (label) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(label);
  console.log(`${"=".repeat(60)}`);
};

const main = async () => {
  try {
    if (isServiceRoleMode) {
      printHeader("Supabase service-role test");
      const { data, error } = await client.from("users").select("id", { count: "exact", head: true });

      if (error) {
        console.error("DB test failed:", error.message);
        process.exit(1);
      }

      console.log("Status: OK");
      console.log(`Table query: users`);
      console.log(`Count: ${data?.length ?? 0}`);
      console.log(`URL: ${serviceRoleUrl}`);
      console.log("Result: service-role client is reachable.");
      return;
    }

    printHeader("Supabase public auth test");
    console.log("Service-role key is not configured, so I am testing the public Supabase client instead.");
    console.log(`URL: ${anonUrl}`);

    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error("Auth test failed:", error.message);
      process.exit(1);
    }

    console.log("Status: OK");
    console.log(`Active session: ${Boolean(data?.session?.user)}`);
    console.log("Result: public Supabase client is reachable.");
    console.log("Tip: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env to test database access.");
  } catch (error) {
    console.error("Unexpected Supabase test failure:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

main();
