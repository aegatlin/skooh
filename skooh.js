#!/usr/bin/env node

const args = process.argv.slice(2);

if (args == ["prepare"]) {
  const fs = require("fs");
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
