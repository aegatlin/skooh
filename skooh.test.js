import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { test } from 'node:test'

test('the skooh.js script runs successfully within skooh itself', () => {
  execSync('./skooh.js')

  const preCommit = fs.readFileSync('./.git/hooks/pre-commit')
  assert(preCommit, '#!/bin/sh\n\nnpm run format && npm run test\n')
  const postCheckout = fs.readFileSync('./.git/hooks/post-checkout')
  assert(postCheckout, '#!/bin/sh\n\nnpx skooh\n')
})
