'use strict'
const _ = require('lodash')
const path = require('path')
const readPackageJson = require('../in/read-package-json')
const emoji = require('../out/emoji')

function init (currentState, userOptions) {
  return new Promise((resolve, reject) => {
    _.each(userOptions, (value, key) => currentState.set(key, value))

    const cwd = path.resolve(currentState.get('cwd'))
    const pkg = readPackageJson(path.join(cwd, 'package.json'))
    currentState.set('cwdPackageJson', pkg)
    currentState.set('cwd', cwd)
    currentState.set('nodeModulesPath', path.join(cwd, 'node_modules'))

    emoji.enabled(currentState.get('emoji'))

    if (currentState.get('cwdPackageJson').error) {
      return reject(currentState.get('cwdPackageJson').error)
    }

    return resolve(currentState)
  })
}

module.exports = init
