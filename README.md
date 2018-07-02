npm-check-unused

> Check for unused dependencies.

### On the command line

This is the easiest way to use `npm-check-unused`.

### Install
```bash
$ npm install -g npm-check-unused
```

### Use
```bash
$ npm-check-unused
```

### Options

```
Usage
  $ npm-check-unused <path> <options>

Path
  Where to check. Defaults to current directory.

Options
  -p, --production      Skip devDependencies.
  -d, --dev-only        Look at devDependencies only (skip dependencies).
  -i, --ignore          Ignore dependencies based on succeeding glob.
  --specials            List of depcheck specials to include in check for unused dependencies.
  --no-emoji            Remove emoji support. No emoji in default in CI environments.
  --debug               Show debug output. Throw in a gist when creating issues on github.

Examples
  $ npm-check-unused           # See what isn't being used.
  $ npm-check-unused ../foo    # Check another path.
```

#### `-p, --production`

By default `npm-check` will look at packages listed as `dependencies` and `devDependencies`.

This option will let it ignore packages listed as `devDependencies`.

#### `-d, --dev-only`

Ignore `dependencies` and only check `devDependencies`.

This option will let it ignore packages listed as `dependencies`.

#### `-i, --ignore`

Ignore dependencies that match specified glob.

`$ npm-check-unused -i babel-*` will ignore all dependencies starting with 'babel-'.

#### `--specials`

Check special (e.g. config) files when looking for unused dependencies.

`$ npm-check-unused --specials=bin,webpack` will look in the `scripts` section of package.json and in webpack config.

See [https://github.com/depcheck/depcheck#special](https://github.com/depcheck/depcheck#special) for more information.

#### `--emoji, --no-emoji`

Enable or disable emoji support. Useful for terminals that don't support them. Automatically disabled in CI servers.

#### `--spinner, --no-spinner`

Enable or disable the spinner. Useful for terminals that don't support them. Automatically disabled in CI servers.

### API

The API is here in case you want to wrap this with your CI toolset.

```js
const npmCheck = require('npm-check');

npmCheck(options)
  .then(currentState => console.log(currentState.get('packages')));
```

#### `ignoreDev`

* Ignore `devDependencies`.
* This is called `--production` on the command line to match `npm`.
* default is `false`

#### `devOnly`

* Ignore `dependencies` and only check `devDependencies`.
* default is `false`

#### `ignore`

* Ignore dependencies that match specified glob.
* default is `[]`

#### `debug`

* Show debug output. Throw in a gist when creating issues on github.
* default is `false`

#### `cwd`

* Override where `npm-check` checks.
* default is `process.cwd()`

#### `specials`

* List of [`depcheck`](https://github.com/depcheck/depcheck) special parsers to include.
* default is `''`

#### `currentState`

The result of the promise is a `currentState` object, look in [state.js](https://github.com/dylang/npm-check/blob/master/lib/util/state.js) to see how it works.

You will probably want `currentState.get('packages')` to get an array of packages and the state of each of them.

Each item in the array will look like the following:

```js
{
  moduleName: 'lodash',                 // name of the module.
  homepage: 'https://lodash.com/',      // url to the home page.
  regError: undefined,                  // error communicating with the registry
  pkgError: undefined,                  // error reading the package.json
  latest: '4.7.0',                      // latest according to the registry.
  installed: '4.6.1',                   // version installed
  isInstalled: true,                    // Is it installed?
  notInstalled: false,                  // Is it installed?
  packageWanted: '4.7.0',               // Requested version from the package.json.
  packageJson: '^4.6.1',                // Version or range requested in the parent package.json.
  devDependency: false,                 // Is this a devDependency?
  usedInScripts: undefined,             // Array of `scripts` in package.json that use this module.
  mismatch: false,                      // Does the version installed not match the range in package.json?
  semverValid: '4.6.1',                 // Is the installed version valid semver?
  easyUpgrade: true,                    // Will running just `npm install` upgrade the module?
  bump: 'minor',                        // What kind of bump is required to get the latest, such as patch, minor, major.
  unused: false                         // Is this module used in the code?
},
```

You will also see this if you use `--debug` on the command line.

### Inspiration

* [npm outdated](https://www.npmjs.com/doc/cli/npm-outdated.html) - awkward output, requires --depth=0 to be grokable.
* [david](https://github.com/alanshaw/david) - does not work with private registries.
* [update-notifier](https://github.com/yeoman/update-notifier) - for single modules, not everything in package.json.
* [depcheck](https://github.com/depcheck/depcheck) - only part of the puzzle. npm-check-unused uses depcheck.

### License
Copyright (c) 2018 Nfer Zhuang, contributors.

Released under the [MIT license](https://tldrlegal.com/license/mit-license).

Screenshots are [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) (Attribution-ShareAlike).
