#!/usr/bin/env node
'use strict'

const meow = require('meow')
const updateNotifier = require('update-notifier')
const isCI = require('is-ci')
const createCallsiteRecord = require('callsite-record')
const pkg = require('../package.json')
const npmCheck = require('./index')
const staticOutput = require('./out/static-output')
const interactiveUpdate = require('./out/interactive-update')
const debug = require('./state/debug')
const pkgDir = require('pkg-dir')

updateNotifier({pkg}).notify()

const cli = meow(`
        Usage
          $ npm-check-unused <path> <options>

        Path
          Where to check. Defaults to current directory. Use -g for checking global modules.

        Options
          -u, --update          Interactive update.
          -g, --global          Look at global modules.
          -p, --production      Skip devDependencies.
          -d, --dev-only        Look at devDependencies only (skip dependencies).
          -i, --ignore          Ignore dependencies based on succeeding glob.
          -E, --save-exact      Save exact version (x.y.z) instead of caret (^x.y.z) in package.json.
          --specials            List of depcheck specials to include in check for unused dependencies.
          --no-color            Force or disable color output.
          --no-emoji            Remove emoji support. No emoji in default in CI environments.
          --debug               Debug output. Throw in a gist when creating issues on github.

        Examples
          $ npm-check-unused           # See what can be updated, what isn't being used.
          $ npm-check-unused ../foo    # Check another path.
          $ npm-check-unused -gu       # Update globally installed modules by picking which ones to upgrade.
    `,
{
  flags: {
    update: {
      type: 'boolean',
      alias: 'u'
    },
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
    saveExact: {
      type: 'boolean',
      alias: 'E'
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
  update: cli.flags.update,
  global: cli.flags.global,
  ignoreDev: cli.flags.production,
  devOnly: cli.flags.devOnly,
  saveExact: cli.flags.saveExact,
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

    if (options.update) {
      return interactiveUpdate(currentState)
    }

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
