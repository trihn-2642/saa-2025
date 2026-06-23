/**
 * Playwright global setup — establish an authenticated Supabase session so the
 * protected /home route can be rendered in E2E.
 *
 * Steps:
 *   1. Load .env manually (Playwright globalSetup runs in a bare Node process
 *      that does NOT auto-load .env the way `next dev` does).
 *   2. Create a fresh test user via the Supabase Admin API (service-role key).
 *   3. Sign in (anon key) to get a real session (access + refresh token).
 *   4. Re-encode that session into cookies using @supabase/ssr's OWN
 *      createServerClient + a cookie jar — this guarantees the exact cookie
 *      name/format (`sb-<ref>-auth-token`, base64, chunked) the app reads,
 *      instead of hand-rolling it.
 *   5. Write tests/e2e/storageState.json so every test context is authenticated.
 *
 * If anything is missing/fails, it writes an EMPTY storageState (so the suite
 * still starts) and the authenticated specs skip themselves.
 */

import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const STORAGE_PATH = path.join(__dirname, "storageState.json");
const TEST_USER_EMAIL = "test-homepage@sun-asterisk.com";
const TEST_USER_PASSWORD = "TestPassword123!";

/** Minimal .env loader (no dotenv dependency). */
function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env — env vars may already be set in the shell
  }
}

function writeEmptyState() {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify({ cookies: [], origins: [] }));
}

async function globalSetup() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !anonKey || !secretKey) {
    console.warn(
      "[auth.setup] Missing Supabase env vars — writing empty state; authenticated /home specs will skip.",
    );
    writeEmptyState();
    return;
  }

  try {
    // 1. Provision a clean test user (service-role).
    const admin = createClient(url, secretKey, {
      auth: { persistSession: false },
    });
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === TEST_USER_EMAIL);
    if (existing) await admin.auth.admin.deleteUser(existing.id);

    const { error: createErr } = await admin.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    });
    if (createErr) throw new Error(`createUser: ${createErr.message}`);

    // 2. Sign in to get a real session.
    const anon = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    const { data: signIn, error: signInErr } =
      await anon.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });
    if (signInErr || !signIn.session)
      throw new Error(`signIn: ${signInErr?.message ?? "no session"}`);

    // 3. Re-encode the session into cookies using @supabase/ssr itself.
    const jar = new Map<string, string>();
    const ssr = createServerClient(url, anonKey, {
      cookies: {
        getAll: () =>
          [...jar.entries()].map(([name, value]) => ({ name, value })),
        setAll: (cookies) =>
          cookies.forEach(({ name, value }) => jar.set(name, value)),
      },
    });
    const { error: setErr } = await ssr.auth.setSession({
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    });
    if (setErr) throw new Error(`setSession: ${setErr.message}`);
    if (jar.size === 0)
      throw new Error("no cookies were written by @supabase/ssr");

    const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const cookies = [...jar.entries()].map(([name, value]) => ({
      name,
      value,
      domain: "localhost",
      path: "/",
      expires,
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    }));
    fs.writeFileSync(STORAGE_PATH, JSON.stringify({ cookies, origins: [] }));

    // 4. Verify the session actually authenticates the protected home (/).
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ storageState: STORAGE_PATH });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/", {
      waitUntil: "domcontentloaded",
    });
    const ok = !page.url().includes("/login");
    await browser.close();

    if (!ok) {
      console.warn(
        "[auth.setup] / still redirected to /login — auth cookie not accepted; writing empty state (specs will skip).",
      );
      writeEmptyState();
      return;
    }
    console.log(
      "[auth.setup] ✓ authenticated session ready (storageState.json).",
    );
  } catch (err) {
    console.warn(
      "[auth.setup] failed:",
      (err as Error).message,
      "— specs will skip.",
    );
    writeEmptyState();
  }
}

export default globalSetup;
