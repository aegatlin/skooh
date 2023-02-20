import fs from 'node:fs'

export function skooh(gitPath = './.git', packageJsonPath = './package.json') {
  if (!isGoodGitPath(gitPath)) process.exit()

  const hooksPath = `${gitPath}/hooks`
  removeAllHooks(hooksPath)
  const hooks = getHooks(packageJsonPath)
  writeHooks(hooks, hooksPath)
  augmentHookPostCheckout(hooksPath)
}

export function isGoodGitPath(gitPath) {
  const exists = fs.existsSync(gitPath)

  if (exists) {
    try {
      fs.accessSync(gitPath, fs.constants.W_OK)
      return true
    } catch {
      console.error(`skooh: skipping: git path not writable: ${gitPath}`)
      return false
    }
  } else {
    console.error(`skooh: skipping: bad git path: ${gitPath}`)
    return false
  }
}

export function removeAllHooks(hooksPath) {
  VALID_HOOKS.forEach((hook) =>
    fs.rmSync(`${hooksPath}/${hook}`, { force: true })
  )
}

export function getHooks(packageJsonPath) {
  const jsonFile = fs.readFileSync(packageJsonPath)
  const json = JSON.parse(jsonFile)
  return json.hooks ? json.hooks : {}
}

export function writeHooks(hooks, hooksPath) {
  for (const [hookName, hookString] of Object.entries(hooks)) {
    if (VALID_HOOKS.includes(hookName)) {
      fs.writeFileSync(`${hooksPath}/${hookName}`, fileContent(hookString), {
        mode: 0o755,
      })
    } else {
      console.error(`skooh: invalid hook: ${hookName}`)
    }
  }
}

export function augmentHookPostCheckout(hooksPath) {
  const p = `${hooksPath}/post-checkout`
  if (fs.existsSync(p)) {
    fs.appendFileSync(p, 'npx skooh\n')
  } else {
    fs.writeFileSync(p, fileContent('npx skooh'))
  }
}

function fileContent(content) {
  return `#!/bin/sh\n\n${content}\n`
}

const VALID_HOOKS = [
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'pre-rebase',
  'post-checkout',
  'post-merge',
  'pre-push',
  'pre-receive',
  'update',
  'proc-receive',
  'post-receive',
  'post-update',
  'reference-transaction',
  'push-to-checkout',
  'pre-auto-gc',
  'post-rewrite',
  'sendemail-validate',
  'fsmonitor-watchman',
  'p4-changelist',
  'p4-prepare-changelist',
  'p4-post-changelist',
  'p4-pre-submit',
  'post-index-change',
]
