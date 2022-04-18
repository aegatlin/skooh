#!/usr/bin/env node

const fs = require("fs");

const args = process.argv.slice(2);

if (args.length == 1 && args[0] == "prepare") {
  prepare();
}

function prepare() {
  const hooks = getHooks("./package.json");
  writeHooks(hooks);
}

function writeHooks(hooks) {
  const scriptTemplate = (hook) => `#!/bin/sh\n\n${hook}\n`;

  const preCommit = hooks["pre-commit"];
  if (preCommit)
    fs.writeFileSync("./.git/hooks/pre-commit", scriptTemplate(preCommit));
}

function getHooks(packageJson) {
  const jsonFile = fs.readFileSync(packageJson);
  const json = JSON.parse(jsonFile);
  return json.hooks;
}
