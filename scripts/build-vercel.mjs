import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { build } from "esbuild";

const OUTPUT = ".vercel/output";
const FUNCTION_DIR = `${OUTPUT}/functions/api/graphql.func`;
const STATIC_DIR = `${OUTPUT}/static`;
const WEB_DIST = "apps/web/dist";

const writeJson = (path, data) => writeFile(path, `${JSON.stringify(data, null, 2)}\n`);

await rm(OUTPUT, { recursive: true, force: true });
await mkdir(FUNCTION_DIR, { recursive: true });
await mkdir(STATIC_DIR, { recursive: true });

await build({
  entryPoints: ["apps/server/src/vercel.ts"],
  outfile: `${FUNCTION_DIR}/index.mjs`,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "info",
});

await cp("apps/server/src/graphql/schema.graphql", `${FUNCTION_DIR}/graphql/schema.graphql`);

await writeJson(`${FUNCTION_DIR}/.vc-config.json`, {
  runtime: "nodejs22.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  shouldAddHelpers: false,
});

if (existsSync(WEB_DIST)) {
  await cp(WEB_DIST, STATIC_DIR, { recursive: true });
} else {
  await writeFile(
    `${STATIC_DIR}/index.html`,
    "<!doctype html><title>Weather Activity Ranker</title><p>API only: POST /api/graphql</p>\n",
  );
}

await writeJson(`${OUTPUT}/config.json`, { version: 3 });
