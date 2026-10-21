import fs from "node:fs";

const [configPath, databaseId, kvId] = process.argv.slice(2);

if (!configPath || !databaseId || !kvId) {
  throw new Error("usage: node prepare-deploy-config.mjs <config> <database-id> <kv-id>");
}

let config = fs.readFileSync(configPath, "utf8");
const d1Pattern =
  /(\[\[d1_databases\]\]\r?\n\s*binding\s*=\s*"DB"\r?\n\s*database_name\s*=\s*"nodewarden-db")(?:\r?\n\s*database_id\s*=\s*"[^"]*")?/;
const kvPattern =
  /(\[\[kv_namespaces\]\]\r?\n\s*binding\s*=\s*"ATTACHMENTS_KV")(?:\r?\n\s*id\s*=\s*"[^"]*")?/;

if (!d1Pattern.test(config) || !kvPattern.test(config)) {
  throw new Error("required D1 or KV binding was not found in the upstream config");
}

config = config
  .replace(d1Pattern, `$1\ndatabase_id = "${databaseId}"`)
  .replace(kvPattern, `$1\nid = "${kvId}"`);

fs.writeFileSync(configPath, config);
