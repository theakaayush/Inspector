import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("manifest requests only active-tab injection permissions", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url)));

  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting"]);
  assert.equal(manifest.background.service_worker, "src/background.js");
  assert.deepEqual(manifest.web_accessible_resources, [{
    resources: ["src/inspector.css"],
    matches: ["<all_urls>"]
  }]);
  assert.equal(manifest.icons["128"], "icons/logo.png");
  assert.equal(manifest.action.default_icon["16"], "icons/logo.png");
});
