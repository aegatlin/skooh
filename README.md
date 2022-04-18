# skooh

```sh
# install as a dev dependency
npm i -D skooh
```

```jsonc
// package.json
{
  "scripts": {
    "prepare": "skooh prepare"
  },
  "hooks": {
    "pre-commit": "npm run test"
  }
}
```

All [valid git hooks](https://git-scm.com/docs/githooks#_hooks) are supported.

## How it works

`prepare` is a [npm life-cycle script](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts) that runs on `npm install` (and at a few other times as well). `skooh prepare` scans your `package.json` for a top-level `"hooks"` block and overwrites the related `.git/hooks/[hook-name]` file. For example, the above setup would result in `.git/hooks/pre-commit` with the following:

```sh
#!bin/sh

npm run test

```

## Skooh vs Husky

To begin with [husky](https://github.com/typicode/husky) is a great git hooks management library with years of battle-tested use. If you need something reliable, choose husky. I've used husky and would recommend it.

The argument in favor of `skooh` is that it is simple with a minimal footprint. As with most other git hook management tools, `skooh` lets you version control your hooks and use them across your team. I wrote `skooh` over using `husky` because I didn't want a `.husky` directory. Nor did I want to manage shell scripts, which felt like too much power for the simpler use cases I use (and try to use) git hooks for. I advocate for simple hooks, mostly just combinations of other package.json scripts. Also, I didn't want to remember the husky cli commands. It is a good CLI but no CLI is better. That is, if you don't count `skooh prepare`, a design I am copying from husky. Lastly, I did not find an alternative solution.
