'use strict'

const readPackageJson = require('./read-package-json')
const _ = require('lodash')
const path = require('path')
const semver = require('semver')
const minimatch = require('minimatch')

function createPackageSummary (moduleName, currentState) {
  const cwdPackageJson = currentState.get('cwdPackageJson')

  const modulePath = path.join(currentState.get('nodeModulesPath'), moduleName)
  const modulePackageJson = readPackageJson(path.join(modulePath, 'package.json'))

  // Ignore private packages
  const isPrivate = Boolean(modulePackageJson.private)
  if (isPrivate) {
    return false
  }

  // Ignore packages that are using github or file urls
  const packageJsonVersion = cwdPackageJson.dependencies[moduleName] ||
        cwdPackageJson.devDependencies[moduleName]

  if (packageJsonVersion && !semver.validRange(packageJsonVersion)) {
    return false
  }

  // Ignore specified '--ignore' package globs
  const ignore = currentState.get('ignore')
  if (ignore) {
    const ignoreMatch = Array.isArray(ignore) ? ignore.some(ignoredModule => minimatch(moduleName, ignoredModule)) : minimatch(moduleName, ignore)
    if (ignoreMatch) {
      return false
    }
  }

  const unusedDependencies = currentState.get('unusedDependencies')
  const unused = _.includes(unusedDependencies, moduleName)

  return {
    moduleName: moduleName,
    unused: unused
  }
}

module.exports = createPackageSummary
