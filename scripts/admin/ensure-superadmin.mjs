#!/usr/bin/env node
/* global console, process, setTimeout */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

const ENV_FILE = resolve(process.cwd(), ".env");
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@%&*_\\-]).{14,128}$/;

function parseEnvValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadLocalEnv() {
  if (!existsSync(ENV_FILE)) {
    return;
  }

  const lines = readFileSync(ENV_FILE, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = parseEnvValue(trimmed.slice(separatorIndex + 1));

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }

  return value;
}

function assertPasswordPolicy(password) {
  if (!PASSWORD_PATTERN.test(password)) {
    throw new Error(
      "ADMIN_SUPERADMIN_PASSWORD precisa ter 14 a 128 caracteres, com maiúscula, minúscula, número e símbolo permitido.",
    );
  }
}

async function waitForSupabase(adminClient) {
  let lastError = null;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const { error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (!error) {
      return;
    }

    lastError = error;
    await new Promise((resolveRetry) => setTimeout(resolveRetry, 1500));
  }

  throw new Error(
    `Supabase local não ficou disponível para administração: ${lastError?.message ?? "erro desconhecido"}`,
  );
}

async function findAuthUserByEmail(adminClient, email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }
  }

  return null;
}

async function ensureAuthUser(adminClient, { email, password, fullName }) {
  const existingUser = await findAuthUserByEmail(adminClient, email);

  if (existingUser) {
    const { data, error } = await adminClient.auth.admin.updateUserById(
      existingUser.id,
      {
        email,
        password,
        user_metadata: {
          full_name: fullName,
        },
      },
    );

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function ensurePublicProfile(
  adminClient,
  { authUserId, email, fullName },
) {
  const { error } = await adminClient.from("users").upsert(
    {
      auth_user_id: authUserId,
      full_name: fullName,
      email,
      role: "superadmin",
      is_active: true,
    },
    { onConflict: "auth_user_id" },
  );

  if (error) {
    throw error;
  }
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = getFirstEnv([
    "SUPABASE_URL",
    "SUPABASE_PUBLIC_URL",
    "API_EXTERNAL_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]);
  const serviceKey = getFirstEnv(["SUPABASE_SECRET_KEY", "SERVICE_ROLE_KEY"]);
  const email = getRequiredEnv("ADMIN_SUPERADMIN_EMAIL").toLowerCase();
  const password = getRequiredEnv("ADMIN_SUPERADMIN_PASSWORD");
  const fullName =
    getFirstEnv(["ADMIN_SUPERADMIN_FULL_NAME"]) || "Superadmin Local";

  if (!supabaseUrl) {
    throw new Error(
      "Configure SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL no .env.",
    );
  }

  if (!serviceKey) {
    throw new Error(
      "Configure SUPABASE_SECRET_KEY ou SERVICE_ROLE_KEY no .env.",
    );
  }

  assertPasswordPolicy(password);

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  await waitForSupabase(adminClient);

  const authUser = await ensureAuthUser(adminClient, {
    email,
    password,
    fullName,
  });

  await ensurePublicProfile(adminClient, {
    authUserId: authUser.id,
    email,
    fullName,
  });

  console.log(`Superadmin local pronto para login: ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
