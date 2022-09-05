# skooh

`skooh` is a git hooks management tool. It has no dependencies and aims to have the simplest developer experience possible.

```sh
npm install -D skooh
npm set-script prepare skooh
```

```json
// package.json
{
  "hooks": {
    "pre-commit": "npm run test"
  }
}
```

All [valid git hooks](https://git-scm.com/docs/githooks#_hooks) are supported.

[1]: https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts

## How-To Guides

### How to run tests in a pre-commit hook

After installing (`npm i -D skooh`) and setting up the prepare script (`npm set-script prepare skooh`), then, assuming you have already setup a `npm run test` script, then add the following as a top-level key to your `package.json` file:

```json
// package.json
{
  "hooks": {
    "pre-commit": "npm run test"
  }
}
```

Then run `npx skooh`, which updates your `.git/hooks/pre-commit` file.

Now, in the future, when you checkout this branch or clone this repo, `skooh`'s builtin `post-checkout` hook will run which will looks for hooks and write them to `.git/hooks/`.

### How to edit your hooks block

When manually editing the package.json hooks block, run `npx skooh` when you are finished. This is normally ran automatically via the `prepare` [life-cycle hook](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts). But, manual edits are **not** detected, so you have to run `npx skooh` for skooh to notice the changes.

## Reference

### skooh

`skooh` sets up your git hooks. Call it by runnings `npx skooh` on the CLI.

## Explanation

The goal of skooh is to version control your git hooks so you have a consistent way of triggering them across teams and development environments. `.git/hooks/` is not version controlled itself, but it is a straightforward, user-friendly, and git-approved way to managing git hooks. This means we _should_ use it for managing hooks. Skooh reads your `package.json` in order to prepare your git hooks.

### How the "prepare: skooh" script works

`prepare` is a [npm life-cycle script](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts) that runs automatically on `npm install` (and at a few other times as well). `prepare` calls `skooh`, which works as follows:

1. It removes previously defined git hooks in preparation for updates.
1. It scans your `package.json` for a top-level `"hooks"` block.
1. It writes all valid hooks to `.git/hooks/`. For example, a `"pre-commit": "npm run test"` hook would result in the file `.git/hooks/pre-commit` with the following contents:

   ```sh
   #!bin/sh

   npm run test

   ```

1. It writes a [post-checkout](https://git-scm.com/docs/githooks#_post_checkout) hook to manage automatic updates (or appends to the one you define). This ensures that differently defined hooks from branches, changesets, etc., are automatically applied.

### Migrating from Husky

Husky changes the hook path in git via the `core.hookspath` setting. You can see your current settings by running `git config -l`. You will need to unset this config by running `git config --unset core.hookspath` in order reset the git hooks path back to `.git/hooks/`.

### Skooh vs Husky

1. To begin with, `husky` is reliable. It has been battle-tested throughout the years. It's a safe bet with good documentation, and the author seems nice, which makes me feel bad when I critise some of the decisions of the library below.

1. But, `husky` edits your `core.hookspath`

   1. This forces you to use husky for all your git hooks, because git isn't looking in the default location anymore, which is `.git/hooks`.
   1. If you move on from `husky` and forget to unset the `core.hookspath` overwrite, you will get unfamiliar errors and have an unpleasant debugging experience (you don't often get "missing git hook" errors, and so it will feel foreign to you).

1. Husky also makes you write a top-level `.husky/` folder that contains all your hooks.

   1. This is overkill for many use-cases, such as when you want to "just" run your linter on `pre-commit`. Do you really want yet another top-level folder which contains "just" a single file with a single line of code in it? I don't. I'd rather have that one-liner in my `package.json`: `"pre-commit": "npm run format"`.

1. Husky has a CLI.
   1. It is simple, but that's because it's almost unnecessary.
   1. You will use it so rarely that you will forget the keywords and help commands.
   1. It's purpose is to help you add simple one-liner code to your `.husky` files. If you didn't have `.husky` files, you wouldn't need the CLI.

In conclusions, it is my opinion that `skooh` is simpler to use than husky. Not top-level directory, no shell script management, no git config overrides, and no CLI needed.

### What does a good git hook look like

I'd argue that the "ideal git hook" is a combination of other package.json scripts. Personally, the goal I aim for in most of my projects is something like the following:

```json
// package.json
{
  "scripts": {
    "format": "...",
    "lint": "...",
    "test": "..."
  },
  "hooks": {
    "pre-commit": "npm run format && npm run lint && npm run test"
  }
}
```
