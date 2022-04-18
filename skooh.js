#!/usr/bin/env node

function writeHooks(hooks) {
  for (const [hookName, hookString] of Object.entries(hooks)) {
    if (validHooks.includes(hookName)) {
      const file = `./.git/hooks/${hookName}`;
      fs.rmSync(file, { force: true });
      fs.writeFileSync(file, `#!/bin/sh\n\n${hookString}\n`, { mode: 0o755 });
    } else {
      console.error(`skooh: skipping invalid hook name: ${hookName}`);
    }
  }
}

function getHooks(packageJson) {
  const jsonFile = fs.readFileSync(packageJson);
  const json = JSON.parse(jsonFile);
  if (json.hooks) return json.hooks;
  console.error('skooh: no "hooks" block found in package.json');
  process.exit();
}

const validHooks = [
  "applypatch-msg",
  "pre-applypatch",
  "post-applypatch",
  "pre-commit",
  "pre-merge-commit",
  "prepare-commit-msg",
  "commit-msg",
  "post-commit",
  "pre-rebase",
  "post-checkout",
  "post-merge",
  "pre-push",
  "pre-receive",
  "update",
  "proc-receive",
  "post-receive",
  "post-update",
  "reference-transaction",
  "push-to-checkout",
  "pre-auto-gc",
  "post-rewrite",
  "sendemail-validate",
  "fsmonitor-watchman",
  "p4-changelist",
  "p4-prepare-changelist",
  "p4-post-changelist",
  "p4-pre-submit",
  "post-index-change",
];

const fs = require("fs");
const args = process.argv.slice(2);

if (args.length == 1 && args[0] == "prepare") {
  const hooks = getHooks("./package.json");
  writeHooks(hooks);
}
