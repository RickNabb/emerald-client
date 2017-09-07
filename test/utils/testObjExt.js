
module.exports = (debug) => {

  const arrayExt = require(__dirname + '/../../utils/arrayExt.js')()
  const objExt = require(__dirname + '/../../utils/objExt.js')(arrayExt)

  let tests = [
    testEquals,
    testEqualsFailure,
    testCopy
  ]

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting Object Extension Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping Object Extension Tests ---")
      resolve()
    })
  }

  function testEquals() {
    return new Promise((resolve, reject) => {
      const obj1 = {
        attr1: [1, 2, 3, [4, 'abc']],
        attr2: {
          embedded1: 'test',
          embed2: true
        }
      }
      const obj2 = {
        attr1: [1, 2, 3, [4, 'abc']],
        attr2: {
          embedded1: 'test',
          embed2: true
        }
      }
      if (objExt.equals(obj1, obj2))
        resolve('Equality Object Test: SUCCESS')
      else
        reject('Equality Object Test: FAILED (did not match)')
    })
  }

  function testEqualsFailure() {
    return new Promise((resolve, reject) => {
      const obj1 = {
        attr1: [1, 2, 3, [4, 'abc']],
        attr2: {
          embedded1: 'test',
          embed2: true
        }
      }
      const obj2 = {
        attr1: [1, 2, 3, [4, 'abc']],
        attr2: {
          embedded1: 'test',
          embed2: false
        }
      }
      if (!objExt.equals(obj1, obj2))
        resolve('Inequality Object Test: SUCCESS')
      else
        reject('Inequality Object Test: FAILED (entries matched)')
    })
  }

  function testCopy() {
    return new Promise((resolve, reject) => {
      const obj1 = {
        attr1: [1, 2, 3, [4, 'abc']],
        attr2: {
          embedded1: 'test',
          embed2: true
        }
      }
      const obj2 = objExt.copy(obj1)
      if (objExt.equals(obj1, obj2))
        resolve('Copy Object Test: SUCCESS')
      else
        reject('Copy Object Test: FAILED (objects did not match)')
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
