/**
* objExt.js
* This module contains a series of extension functions for object manipulations.
*/

module.exports = (arrayExt) => {

  function equals(obj1, obj2) {
    let key
    if (!obj1 || !obj2)
      return false
    for (key in obj1) {
      const val1 = obj1[key]
      const val2 = obj2[key]
      if (val1 instanceof Array && val2 instanceof Array) {
        if (!arrayExt.equals(val1, val2))
          return false
      }
      else if (val1 instanceof Object && val2 instanceof Object) {
        if (!equals(val1, val2))
          return false
      }
      else if (val1 !== val2)
        return false
    }
    return true
  }

  /**
   * Create a deep copy of a javascript object.
   * @param  {Object} obj The object to copy.
   * @return {Object} A deep copy of obj.
   */
  function copy(obj) {
    let newObj = Object.keys(obj).reduce(function(previous, current) {
      previous[current] = obj[current]
      return previous
    }, {})
    return newObj
  }

  return {
    "equals": equals,
    "copy": copy
  }
}
