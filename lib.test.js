import fs from 'fs'
import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import {
  augmentHookPostCheckout,
  getHooks,
  isGoodGitPath,
  removeAllHooks,
  skooh,
  writeHooks,
} from './lib.js'

const testPath = './test'

describe('skooh', () => {
  const gitPath = `${testPath}/git`
  const hooksPath = `${gitPath}/hooks`
  const packageJsonPath = './test/package.json'

  beforeEach(() => {
    fs.mkdirSync(hooksPath, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('works in a happy path', () => {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        hooks: {
          'pre-commit': 'echo hello',
        },
      })
    )

    skooh(gitPath, packageJsonPath)

    const preCommit = fs.readFileSync(`${hooksPath}/pre-commit`, 'utf8')
    assert.equal(preCommit, '#!/bin/sh\n\necho hello\n')
    const postCheckout = fs.readFileSync(`${hooksPath}/post-checkout`, 'utf8')
    assert.equal(postCheckout, '#!/bin/sh\n\nnpx skooh\n')
  })
})

describe('isGoodGitPath', () => {
  beforeEach(() => {
    fs.mkdirSync(testPath)
  })

  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('returns true for accessible git path', () => {
    const actual = isGoodGitPath('./.git')
    assert.equal(actual, true)
  })

  /*
  `.git/` could not get copied into some environments. E.g., Docker builds.
  */
  it('returns false for nonexistent git path', () => {
    assert.equal(isGoodGitPath('./.badPath'), false)
  })

  /*
  Sometimes the user does not have write permissions for `.git/`. E.g., Github
  Actions.
  */
  it('returns false for non-writeable git path', () => {
    fs.mkdirSync(`${testPath}/dirNoWrite`, { mode: 0o555 })

    const actual = isGoodGitPath('./testDirNoWrite')
    assert.equal(actual, false)
  })
})

describe('removeAllHooks', () => {
  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('removes all hooks, and nothing else, from hooksPath', () => {
    const hooksPath = `${testPath}/hooks`
    fs.mkdirSync(hooksPath, { recursive: true })
    fs.writeFileSync(`${hooksPath}/pre-commit`, 'asdf')
    fs.writeFileSync(`${hooksPath}/pre-commit.sample`, 'asdf')

    removeAllHooks(hooksPath)
    const actual = fs.readdirSync(hooksPath)
    assert.deepEqual(actual, ['pre-commit.sample'])
  })
})

describe('getHooks', () => {
  const packageJsonPath = `${testPath}/package.json`

  beforeEach(() => {
    fs.mkdirSync(testPath)
  })

  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('gets hooks from packageJsonPath', () => {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        hooks: {
          'pre-commit': 'random text',
        },
      })
    )
    const hooks = getHooks(packageJsonPath)
    assert.equal(hooks['pre-commit'], 'random text')
  })

  it('returns empty when no hooks block is found', () => {
    fs.writeFileSync(packageJsonPath, '{}')
    const hooks = getHooks(packageJsonPath)
    assert.equal(Object.keys(hooks).length, 0)
  })
})

describe('writeHooks', () => {
  const hooksPath = `${testPath}/hooks`

  beforeEach(() => {
    fs.mkdirSync(hooksPath, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('writes hooks into hooksPath', () => {
    const hooks = { 'pre-commit': 'pre-commit code' }
    writeHooks(hooks, hooksPath)

    const actual = fs.readFileSync(`${hooksPath}/pre-commit`, 'utf8')
    assert.equal(actual, '#!/bin/sh\n\npre-commit code\n')
  })

  it('invalid hook names are skipped with error logs', () => {
    const messages = []
    mock.method(console, 'error', (msg) => {
      messages.push(msg)
    })

    const hooks = { 'bad-hook-name': 'any code' }
    writeHooks(hooks, hooksPath)

    assert.equal(fs.existsSync(`${hooksPath}/bad-hook-name`), false)
    assert.deepEqual(messages, [
      'skooh: skipping invalid hook name: bad-hook-name',
    ])
    mock.reset()
  })
})

describe('augmentHookPostCheckout', () => {
  const hooksPath = `${testPath}/hooks`

  beforeEach(() => {
    fs.mkdirSync(hooksPath, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('when there is NO post-checkout hook, write one', () => {
    augmentHookPostCheckout(hooksPath)

    const hook = fs.readFileSync(`${hooksPath}/post-checkout`, 'utf8')
    assert.equal(hook, '#!/bin/sh\n\nnpx skooh\n')
  })

  it('when there is a post-checkout hook, append to it', () => {
    fs.writeFileSync(
      `${hooksPath}/post-checkout`,
      '#!/bin/sh\n\nsome content\n'
    )

    augmentHookPostCheckout(hooksPath)

    const hook = fs.readFileSync(`${hooksPath}/post-checkout`, 'utf8')
    assert.equal(hook, '#!/bin/sh\n\nsome content\nnpx skooh\n')
  })
})
