/**
* fsExt.js
* Any functions that are extensions to the node fs module.
*/

module.exports = (debug, fs, path, promise, arrayExt) => {

  const mkdirPromise = promise.denodeify(fs.mkdir)
  const readdirPromise = promise.denodeify(fs.readdir)
  const readfilePromise = promise.denodeify(fs.readFile)
  const writefilePromise = promise.denodeify(fs.writeFile)
  const unlinkPromise = promise.denodeify(fs.unlink)
  const rmdirPromise = promise.denodeify(fs.rmdir)

  /**
   * Recursively read through a directory to find files that pass
   * a given predicate function.
   * @param  {String} p     The path to recursively search through.
   * @param  {Function} judge A predicate function to judge the filenames that are
   * found.
   * @return {Array}       An array of filenames & paths that passed the predicate
   * function test.
   */
  function readdirRecursive(p, judge, skip) {
    return new Promise(async (resolve, reject) => {
      let listing = await readdirPromise(p)
      let files = [], dirs = [], file
      // TODO : Switch to reduce
      listing.map((file) => {
        file = path.join(p, file)
        let doSkip = skip(file)
        if (fs.lstatSync(file).isDirectory() && !doSkip) {
          dirs.push(readdirRecursive(file, judge, skip))
        }
        else
          files.push(judge(file))
      })
      files = await Promise.all(files)
      dirs = await Promise.all(dirs)
      resolve(arrayExt.clean(files).concat(arrayExt.clean(dirs)))
    })
  }

  /**
   * Get a filename's extension.
   * @param  {String} filename The filename to fetch the extension of.
   * @return {String}          The extension on the passed filename arg, or the
   * full filename if no extension was found.
   */
  function getFileExtension(filename) {
    return new Promise((resolve, reject) => {
      resolve(filename.substring(filename.lastIndexOf('.')))
    })
  }

  return {
    "readdirRecursive": readdirRecursive,
    "getFileExtension": getFileExtension,
    "mkdirPromise": mkdirPromise,
    "readdirPromise": readdirPromise,
    "readfilePromise": readfilePromise,
    "writefilePromise": writefilePromise,
    "unlinkPromise": unlinkPromise,
    "rmdirPromise": rmdirPromise
  }
}
