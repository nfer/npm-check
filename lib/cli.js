#!/usr/bin/env node
'use strict'

const meow = require('meow')
const updateNotifier = require('update-notifier')
const isCI = require('is-ci')
const createCallsiteRecord = require('callsite-record')
const pkg = require('../package.json')
const npmCheck = require('./index')
const staticOutput = require('./out/static-output')
const debug = require('./state/debug')
const pkgDir = require('pkg-dir')

updateNotifier({pkg}).notify()

const cli = meow(`
        Usage
          $ npm-check-unused <path> <options>

        Path
          Where to check. Defaults to current directory. Use -g for checking global modules.

        Options
          -g, --global          Look at global modules.
          -p, --production      Skip devDependencies.
          -d, --dev-only        Look at devDependencies only (skip dependencies).
          -i, --ignore          Ignore dependencies based on succeeding glob.
          --specials            List of depcheck specials to include in check for unused dependencies.
          --no-color            Force or disable color output.
          --no-emoji            Remove emoji support. No emoji in default in CI environments.
          --debug               Debug output. Throw in a gist when creating issues on github.

        Examples
          $ npm-check-unused           # See what isn't being used.
          $ npm-check-unused ../foo    # Check another path.
    `,
{
  flags: {
    global: {
      type: 'boolean',
      alias: 'g'
    },
    production: {
      type: 'boolean',
      alias: 'p'
    },
    devOnly: {
      type: 'boolean',
      alias: 'd'
    },
    ignore: {
      type: 'string',
      alias: 'i'
    },
    specials: {
      type: 'string'
    },
    noColor: {
      type: 'boolean'
    },
    emoji: {
      type: 'boolean',
      default: !isCI
    },
    debug: {
      type: 'boolean'
    }
  }
})

const options = {
  cwd: cli.input[0] || pkgDir.sync() || process.cwd(),
  global: cli.flags.global,
  ignoreDev: cli.flags.production,
  devOnly: cli.flags.devOnly,
  specials: cli.flags.specials,
  emoji: cli.flags.emoji,
  installer: process.env.NPM_CHECK_INSTALLER || 'npm',
  debug: cli.flags.debug,
  spinner: !isCI,
  ignore: cli.flags.ignore
}

if (options.debug) {
  debug('cli.flags', cli.flags)
  debug('cli.input', cli.input)
}

npmCheck(options)
  .then(currentState => {
    currentState.inspectIfDebugMode()

    return staticOutput(currentState)
  })
  .catch(err => {
    console.log(err.message)
    if (options.debug) {
      console.log(createCallsiteRecord(err).renderSync())
    } else {
      console.log('For more detail, add `--debug` to the command')
    }
    process.exit(1)
  })
