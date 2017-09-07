/**
* main.js
* The main entry point to run the Emerald Engine test suite.
*/

/**
 * The file system module.
 */
const fs = require('fs')

/**
 * The promise node module.
 */
const promise = require('promise')

/**
* The path node module.
*/
const path = require('path')

/**
 * The debug module.
 */
const debug = require(__dirname + '/../utils/debug.js')

/**
 * Load in the JSON configuration.
 */
const config = require(__dirname + "/config.json")

/**
 * The array extensions module.
 */
const arrayExt = require(__dirname + '/../utils/arrayExt.js')()

/**
 * The fs extensions module.
 */
const fsExt = require(__dirname + '/../utils/fsExt.js')(debug, fs, path, promise, arrayExt)

/**
 * The Test Suite utility module.
 */
const utils = require(__dirname + '/utils.js')(fsExt)

/**
 * The fs extensions class tests.
 */
const testFsExt = require(__dirname + '/utils/testFsExt.js')(debug, utils, fs, path, promise)

/**
 * The array extensions module tests.
 */
const testArrayExt = require(__dirname + '/utils/testArrayExt.js')(debug)

/**
 * A test emerald configuration for the test suite's engine modules.
 */
const testConfig = require(__dirname + '/emerald-test-config.json')

/**
 * The packet manager tests.
 */
const testPacketManager = require(__dirname + '/testPacketManager.js')(testConfig, utils, debug, fs, path, promise)

/**
 * The object extensions module tests.
 */
const testObjExt = require(__dirname + '/utils/testObjExt.js')(debug)

/**
 * Run the test suite.
 */
async function run() {
  let test
  for (test in config) {
    if (config[test] === 1) {
      if (test === "testFsExt")
        await testFsExt.run()
      else if (test === 'testArrayExt')
        await testArrayExt.run()
      else if (test === 'testPacketManager')
        await testPacketManager.run()
      else if (test === 'testObjExt')
        await testObjExt.run()
    }
  }
}

run()
