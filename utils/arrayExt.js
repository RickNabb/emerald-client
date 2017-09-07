/**
* arrayExt.js
* This module contains a series of extension functions for array manipulations.
*/

module.exports = () => {

  function clean(arr) {
    let entry, cleaned = []
    const dirty = [undefined, [], '', {}, null]
    for (entry in arr) {
      entry = arr[entry]
      if (entry instanceof Array) {
        if (!equals(entry, []))
          cleaned.push(entry)
      }
      else if (dirty.indexOf(entry) < 0) {
        cleaned.push(entry)
      }
    }
    return cleaned
  }

  function flatten(arr) {
    let flat = [], entry
    for (entry in arr) {
      entry = arr[entry]
      if (Array.isArray(entry))
        flat = flat.concat(flatten(entry))
      else flat.push(entry)
    }
    return flat
  }

  function equals(arr1, arr2) {
    let index
    if (!arr1 || !arr2)
      return false
    if (arr1.length !== arr2.length)
      return false
    for (index in arr1) {
      const entry1 = arr1[index]
      const entry2 = arr2[index]
      if (entry1 instanceof Array && entry2 instanceof Array) {
        if (!equals(entry1, entry2))
          return false
      }
      else if (entry1 !== entry2)
        return false
    }
    return true
  }

  return {
    "clean": clean,
    "flatten": flatten,
    "equals": equals
  }
}
