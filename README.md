# skooh

```js
npm i -D skooh
```

```json
{
  "scripts": {
    "prepare": "skooh prepare"
  },
  "hooks": {
    "pre-commit": "npm run test"
  }
}
```

## How it works

`prepare` is a life-cycle script of npm that gets run on calls to `npm install` (among others). `skooh prepare` will read your package.json, find the `hooks` section, and overwrite the appropriate `.git/hooks/[hook-name]` file. For example, the above setup would result in `.git/hooks/pre-commit` with the following:

```sh
#!bin/sh

npm run test

```
