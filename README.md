# skooh

`skooh` is a git hooks management tool. It has no dependencies. It aims to have the simplest developer experience possible.

```sh
# install as a dev dependency
npm i -D skooh
```

```jsonc
// package.json
{
  "scripts": {
    "prepare": "skooh"
  },
  "hooks": {
    "pre-commit": "npm run test"
  }
}
```

All [valid git hooks](https://git-scm.com/docs/githooks#_hooks) are supported.

When manually editing the package.json hooks block, run `npx skooh`. (The `prepare` [life-cycle hook][1] does not trigger in such scenarios.)

[1]: https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts

## How it works

`prepare` is a [npm life-cycle script][1] that runs on `npm install` (and at a few other times as well). `prepare` calls `skooh` which works as follows:

1. It removes previously defined git hooks in preparation for updates.
1. It scans your `package.json` for a top-level `"hooks"` block.
1. It writes all valid hooks to `.git/hooks/`. For example, the above setup would result in a `.git/hooks/pre-commit` as follows:

   ```sh
   #!bin/sh

   npm run test

   ```

1. It writes a [post-checkout](https://git-scm.com/docs/githooks#_post_checkout) hook to manage automatic updates (or appends to the one you define). This ensures that differently defined hooks from branches, changesets, etc., are automatically applied. (This might sound fancy, but it's not. It just calls `npx skooh` in the post-checkout hook.)

## Migrating from Husky

Husky changes the hook path in git via the `core.hookspath` setting. You can see your current settings by running `git config -l`. You will need to unset this config by running `git config --unset core.hookspath` in order reset the git hooks path back to `.git/hooks`.

## Skooh vs Husky

What `skooh`, `husky`, and every other git hooks management solution has in common is the goal of adding git hooks to version control. This allows for a consistent distributed developer experience since you can run things like linters, formatters, and anything else you'd like, across your distributed team.

The argument in favor of `husky` is that it is reliable. It has been battle-tested throughout the years. It is a good library and I would recommend it if you want something reliable and simple enough.

The argument in favor of `skooh` is as follows:

1. The simplest developer experience possible
   1. No top-level directory (like `.husky/`)
   1. No shell scripts to manage, either manually, or via a cli command (like `husky add`)
   1. No CLI at all (unless you count, `npx skooh` itself)
1. Encourages simple hooks

   I'd argue that the "ideal git hook" is a combination of other package.json scripts.
