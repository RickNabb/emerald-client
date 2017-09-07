
module.exports = (debug, utils, fs, path, promise) => {

  const arrayExt = require(__dirname + '/../../utils/arrayExt.js')()
  const fsExt = require(__dirname + '/../../utils/fsExt.js')(debug, fs, path, promise, arrayExt)

  let tests = [
    prepareTempFileStructure,
    testGetFileExtension,
    testReaddirRecursivePromise
  ]

  const dirs = [ '.temp/', '.temp/.temp2/', '.temp/.temp3/', '.temp/.temp3/.temp4/']
  const files = {
    '.temp/.temp3/.temp4/file.js': "",
    '.temp/file2.txt': "",
    '.temp/.temp2/file3.png': "",
    '.temp/.temp3/file4.txt': ""
  }

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting FS Extension Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping FS Extension Tests ---")
      resolve()
    })
  }

  function prepareTempFileStructure() {
    return utils.prepareTempFileStructure(dirs, files)
  }

  function testReaddirRecursivePromise() {
    return new Promise(async (resolve, reject) => {
      const judge = (file) => {
        return new Promise(async (resolve, reject) => {
          const pass = await fsExt.getFileExtension(file) === '.js'
          if (pass) resolve(file)
          else resolve()
        })
      }
      let files = await fsExt.readdirRecursive(__dirname + '/../.temp/', judge, () => { return false })
      files = arrayExt.flatten(files)
      if (files[0].indexOf(".temp\\.temp3\\.temp4\\file.js") > -1)
        resolve('Read Dir Recursive: SUCCESS')
      else
        reject('Read Dir Recursive: FAILED (returned wrong files)')
    })
  }

  function testGetFileExtension() {
    return new Promise(async (resolve, reject) => {
      const ext = await fsExt.getFileExtension('./temp/file.txt')
        .catch(err => reject('Get File Extension: FAILED ( ' + err + ')'))
      if (ext  === '.txt')
        resolve('Get File Extension: SUCCESS')
      else
        reject('Get File Extension: FAILED (wrong extension)')
    })
  }

  function cleanUp() {
    return utils.cleanUp(dirs, files)
  }

  return {
    "run": run
  }
}
