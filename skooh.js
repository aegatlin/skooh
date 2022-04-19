#!/usr/bin/env node

const fs = require("fs");

function writeHooks(hooks) {
  for (const [hookName, hookString] of Object.entries(hooks)) {
    if (VALID_HOOKS.includes(hookName)) {
      writeHook(hookName, hookString);
    } else {
      console.error(`skooh: skipping invalid hook name: ${hookName}`);
    }
  }
}

function writeHook(hookName, hookString) {
  fs.writeFileSync(getHookPath(hookName), getHookScript(hookString), {
    mode: 0o755,
  });
}

function getHookPath(hookName) {
  return `./.git/hooks/${hookName}`;
}

function getHookScript(hookString) {
  return `#!/bin/sh\n\n${hookString}\n`;
}

function removeAllHooks() {
  VALID_HOOKS.forEach((hook) => fs.rmSync(getHookPath(hook), { force: true }));
}

function augmentPostCheckout(hooks) {
  if (hooks["post-checkout"]) {
    fs.appendFileSync(getHookPath("post-checkout"), "\nnpx skooh\n");
  } else {
    writeHook("post-checkout", "npx skooh");
  }
}

function getHooks(packageJson) {
  const jsonFile = fs.readFileSync(packageJson);
  const json = JSON.parse(jsonFile);
  if (json.hooks) return json.hooks;
  console.error('skooh: no "hooks" block found in package.json');
  process.exit();
}

const VALID_HOOKS = [
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

removeAllHooks();
const hooks = getHooks("./package.json");
writeHooks(hooks);
augmentPostCheckout(hooks);
