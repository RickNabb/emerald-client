/**
 * Emerald Test Suite Utilities
 * Copyright (C) Nick Rabb <nick.rabb2@gmail.com> 2017
 * 
 * This module contains a series of functions that are shared
 * and reused throughout the Emerald Test Suite tests.
 */
module.exports = (fsExt) => {

  /**
   * Clean up by destroying the files and directories passed through.
   * @param {Array} dirs An array of directories to create (full path needed)
   * @param {Object} files An Object of format { 'filePath': 'fileContents', ... }
   */
  function prepareTempFileStructure(dirs, files) {
    return new Promise(async (resolve, reject) => {
      dirs.map(async (dir) => {
        await fsExt.mkdirPromise(__dirname + '/' + dir).catch(err => reject('Prepare Temp File Structure: FAILED (' + err + ')'))
       })
      let promises = []
      Object.keys(files).map(file => promises.push(fsExt.writefilePromise(__dirname + '/' + file, files[file])))
      await Promise.all(promises)
        .catch(err => reject('Prepare Temp File Structure: FAILED (' + err + ')'))
      resolve('Prepare Temp File Structure: SUCCESS')
    })
  }

  /**
   * Clean up by destroying the files and directories passed through.
   * @param {Array} dirs An array of directories to create (full path needed)
   * @param {Object} files An Object of format { 'filePath': 'fileContents', ... }
   */
  function cleanUp(dirs, files) {
    return new Promise(async (resolve, reject) => {
      let promises = []
      let file, dir
      // This could not be done in parallel because Promises.all was not
      // deleting the files before the directories were being deleted
      for (file in files) {
        await fsExt.unlinkPromise(__dirname + '/' + file)
      }
      dirs.reverse()
      for (dir in dirs) {
        dir = dirs[dir]
        await fsExt.rmdirPromise(__dirname + '/' + dir)
          .catch(err => console.log(err))
      }
      resolve()
    })
  }

  return {
    "prepareTempFileStructure": prepareTempFileStructure,
    "cleanUp": cleanUp
  }
}