# skooh

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

When manually editing the hooks block, run `npx skooh`. (The `prepare` [life-cycle hook][1] will not trigger in such scenarios.)

[1][https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts]

## How it works

`prepare` is a [npm life-cycle script][1] that runs on `npm install` (and at a few other times as well). `prepare` calls `skooh` which works as follows:

1. It removes previously defined git hooks in preparation for updates.
1. It scans your `package.json` for a top-level `"hooks"` block.
1. It writes all valid hooks to `.git/hooks/`. For example, the above setup would result in `.git/hooks/pre-commit` with the following:

   ```sh
   #!bin/sh

   npm run test

   ```

1. It writes (or appends) `npx skooh` to the [post-checkout](https://git-scm.com/docs/githooks#_post_checkout) hook, which runs `skooh` on rebase, pull, etc. This allows hooks in different branches, or hooks from changesets, to update automatically. For example, with no `post-checkout` hook defined, as in the above setup, the resulting `.git/hooks/post-checkout` is as follows:

   ```sh
   #!bin/sh

   npx skooh

   ```

## Migrating from Husky

Husky changes the hook path in git via the `core.hookspath` setting. You can see your current settings by running `git config -l`. You will need to unset this config by running `git config --unset core.hookspath` in order reset the git hooks path back to `.git/hooks`.

## Skooh vs Husky

To begin with [husky](https://github.com/typicode/husky) is a great git hooks management library with years of battle-tested use. If you need something reliable, choose husky. I've used husky and would recommend it.

The argument in favor of `skooh` is that it is simple with a minimal footprint. As with most other git hook management tools, `skooh` lets you version control your hooks and use them across your team. I wrote `skooh` over using `husky` because I didn't want a `.husky` directory, nor did I want to manage shell scripts, which felt like too much power for the simpler use cases I use (and try to use) git hooks for. I advocate for simple hooks, mostly just combinations of other package.json scripts. Also, I didn't want to remember the husky cli commands. It is a good CLI but no CLI is better. That is, if you don't count `skooh prepare`, a design I am copying from husky. Lastly, I did not find an alternative solution.
