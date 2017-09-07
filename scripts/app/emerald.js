/**
* app.js
* The main file for the client side of the application
*/

define(function (require) {
  return new Promise(async (resolve, reject) => {
    let socket = require('../../socket.io/socket.io')()
    let packetManager = await require('./packetManager')(socket)
    $(document).foundation()
    document.emerald = {
      "socket": socket,
      "packetManager": packetManager
    }
  })
})
