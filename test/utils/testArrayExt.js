
module.exports = (debug) => {

  const arrayExt = require(__dirname + '/../../utils/arrayExt.js')()

  let tests = [
    testEquals,
    testEqualsFailure,
    testClean,
    testFlatten
  ]

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting Array Extension Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping Array Extension Tests ---")
      resolve()
    })
  }

  function testEquals() {
    return new Promise((resolve, reject) => {
      const arr1 = [1, 2, 'abc', [4, 5, "def"]]
      const arr2 = arr1.slice(0)
      if (arrayExt.equals(arr1, arr2))
        resolve('Equality Array Test: SUCCESS')
      else
        reject('Equality Array Test: FAILED (did not match)')
    })
  }

  function testEqualsFailure() {
    return new Promise((resolve, reject) => {
      const arr1 = [1, 2, 'abc', [4, 5, "def"]]
      const arr2 = [1, 3, 'abc', [4, 5, "def"]]
      if (!arrayExt.equals(arr1, arr2))
        resolve('Inequality Array Test: SUCCESS')
      else
        reject('Inequality Array Test: FAILED (entries matched)')
    })
  }

  function testClean() {
    return new Promise((resolve, reject) => {
      const dirty = [undefined, undefined, null, 1, [], 2, '', 3, 4]
      let clean = arrayExt.clean(dirty)
      if (arrayExt.equals(clean, [1, 2, 3, 4]))
        resolve('Clean Array Test: SUCCESS')
      else
        reject('Clean Array Test: FAILED (invalid entries in result)')
    })
  }

  function testFlatten() {
    return new Promise((resolve, reject) => {
      const unflat = [1, 2, [3, 4, [5, 6]], [[7, 8]]]
      let flat = arrayExt.flatten(unflat)
      if (arrayExt.equals(flat, [1, 2, 3, 4, 5, 6, 7, 8]))
        resolve('Flatten Array Test: SUCCESS')
      else
        reject('Flatten Array Test: FAILED (invalid entries in result)')
    })
  }

  function cleanUp() {
    return new Promise(async (resolve, reject) => {
      resolve()
    })
  }

  return {
    "run": run
  }
}
