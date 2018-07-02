'use strict'

const chalk = require('chalk')
const _ = require('lodash')
const stripAnsi = require('strip-ansi')
const table = require('text-table')
const emoji = require('./emoji')

function render (pkg, currentState) {
  const packageName = pkg.moduleName
  const rows = []

  const indent = '           ' + emoji('   ')
  // DYLAN: clean this up
  const status = _([
    pkg.notInstalled ? chalk.bgRed.white.bold(emoji(' :worried: ') + ' MISSING! ') + ' Not installed.' : '',
    pkg.notInPackageJson ? chalk.bgRed.white.bold(emoji(' :worried: ') + ' PKG ERR! ') + ' Not in the package.json. ' + pkg.notInPackageJson : '',
    pkg.pkgError && !pkg.notInstalled ? chalk.bgGreen.white.bold(emoji(' :worried: ') + ' PKG ERR! ') + ' ' + chalk.red(pkg.pkgError.message) : '',
    pkg.unused ? [
      chalk.black.bold.bgWhite(emoji(' :confused: ') + ' NOTUSED? ') + ` ${chalk.yellow(`Still using ${packageName}?`)}`,
      indent + `Depcheck did not find code similar to ${chalk.green(`require('${packageName}')`)} or ${chalk.green(`import from '${packageName}'`)}.`,
      indent + `Check your code before removing as depcheck isn't able to foresee all ways dependencies can be used.`,
      indent + `To remove this package: ${chalk.green(`npm uninstall --save${pkg.devDependency ? '-dev' : ''} ${packageName}`)}`
    ] : '',
    pkg.mismatch && !pkg.bump ? chalk.bgRed.yellow.bold(emoji(' :interrobang: ') + ' MISMATCH ') + ' Installed version does not match package.json. ' + pkg.installed + ' ≠ ' + pkg.packageJson : '',
    pkg.regError ? chalk.bgRed.white.bold(emoji(' :no_entry: ') + ' NPM ERR! ') + ' ' + chalk.red(pkg.regError) : ''
  ])
    .flatten()
    .compact()
    .valueOf()

  if (!status.length) {
    return false
  }

  rows.push(
    [
      chalk.yellow(packageName),
      status.shift()
    ])

  while (status.length) {
    rows.push([
      ' ',
      status.shift()
    ])
  }

  rows.push(
    [
      ' '
    ])

  return rows
}

function outputConsole (currentState) {
  const packages = currentState.get('packages')

  const rows = packages.reduce((acc, pkg) => {
    return acc.concat(render(pkg, currentState))
  }, [])
    .filter(Boolean)

  if (rows.length) {
    const renderedTable = table(rows, {
      stringLength: s => stripAnsi(s).length
    })

    console.log('')
    console.log(renderedTable)
    process.exitCode = 1
  } else {
    console.log(`${emoji(':heart:  ')}Your modules look ${chalk.bold('amazing')}. Keep up the great work.${emoji(' :heart:')}`)
    process.exitCode = 0
  }
}

module.exports = outputConsole
