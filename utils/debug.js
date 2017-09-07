/**
* debug.js
* A handy debugging library for ease of error and warning
* tracing throughout the execution of the server.
*/

/**
 * debug - Write a debug message to the console.
 *
 * @param  {string} message The message to write to console.
 */
function log (message) {
  var path = _getCallerFile();
  console.log('[' + path.substring(path.lastIndexOf('\\')+1) + '] ' + message)
}

/**
 * error - Write an error to the console.
 *
 * @param  {string} message The message to write.
 * @param  {boolean} stack   Whether or not to write a stack trace.
 */
function error (message, stack) {
  if (stack) {
    log("ERROR: " + message + "\n\n" + new Error().stack)
  }
  else {
    log("ERROR: " + message)
  }
}

/**
 * _getCallerFile - A function to get the file path of the method that
 * is the caller of whatever function calls this.
 */
function _getCallerFile() {
    try {
        var err = new Error();
        var callerfile;
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) return callerfile;
        }
    } catch (err) {}
    return undefined;
}

exports.log = log;
exports.error = error;
