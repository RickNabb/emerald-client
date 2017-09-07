/**
* beryl.js
* The server implementation for the SocketIO test app.
* This is the main point of entry.
*/

/**
 * The ExpressJS module to set up routing for the client side of the app.
 */
let express = require('express')
let app = express()

/**
 * The HTTP module for routing.
 */
let http = require('http').Server(app)

/**
 * The socketIO module for handling app communications.
 */
let io = require('socket.io')(http, {'pingInterval': 15000, 'pingTimeout': 30000})

/**
 * The path module for resolving filepaths.
 */
let path = require('path')

/**
 * The file system module.
 */
let fs = require('fs')

/**
 * The module we can use to convert async Node FUNCTIONS
 * into those using promises.
 */
let promise = require('promise')

/**
 * A custom debugging framework for the application.
 */
let debug = require('./utils/debug.js')

/**
 * A module containing array extension functions.
 */
let arrayExt = require('./utils/arrayExt.js')()

/**
 * A module containing file structure extension functions.
 */
let fsExt = require('./utils/fsExt.js')(debug, fs, path, promise, arrayExt)

/**
 * A module containing object extension functions.
 */
let objExt = require('./utils/objExt.js')(arrayExt)

/**
 * The packet manager module.
 */
let packetManager

/**
 * init - The initialization method.
 * Modules that load asynchronously are loaded here as well.
 */
async function init() {
  // Start the server
  debug.log('Beryl Server Started...')
  const config = await loadConfig()
  setupStaticImports(config)

  packetManager = require('./packetManager.js')(config, debug, fs, promise, fsExt, objExt)
  debug.log(await packetManager.init())

  // Also should use some sort of cacheing to make this faster
  app.use('/packetManifest', express.static(path.join(__dirname, '/.packetManifest.json')))

  servePackets()

  // process.on('uncaughtException', (exception) => {
  //   debug.error(exception, true)
  //   process.exit()
  // })
  http.listen(config.connection.port, function() {
    debug.log("Listening on *:" + config.connection.port + "...")
  })

  setupRoutes()
}

async function servePackets() {
  const jsPackets = packetManager.convertPacketsToJavascript(packetManager.packets)
  let writePromises = []
  let packet
  if (fs.existsSync(__dirname + '/.packets') === false) {
    writePromises = [ 
      fsExt.mkdirPromise(__dirname + '/.packets'),
      fsExt.mkdirPromise(__dirname + '/.packets/in'),
      fsExt.mkdirPromise(__dirname + '/.packets/out') 
    ]
    await Promise.all(writePromises)
      .catch(err => debug.error(err))
    writePromises = []
  }
  Object.keys(jsPackets.in).reduce((promises, key) => {
    promises.push(fsExt.writefilePromise(__dirname + '/.packets/in/' + key + '.js', jsPackets.in[key]))
    return promises
  }, writePromises)
  Object.keys(jsPackets.out).reduce((promises, key) => {
    promises.push(fsExt.writefilePromise(__dirname + '/.packets/out/' + key + '.js', jsPackets.out[key]))
    return promises
  }, writePromises)
  await Promise.all(writePromises)
    .catch(err => debug.error(err))
  app.use('/packets/in/', express.static(path.join(__dirname, '/.packets/in/')))
  app.use('/packets/out/', express.static(path.join(__dirname, '/.packets/out/')))
  // TODO : Maybe clean up and delete the files?
}

function loadConfig() {
  return new Promise(async (resolve, reject) => {
    const judge = (file) => {
      return new Promise(async (resolve, reject) => {
        if (file.indexOf('emerald-config.json') > -1)
          resolve(file)
        else resolve()
      })
    }
    // We should pass over some well-known, large directories
    const skip = (file) => {
      return file.indexOf('node_modules') > -1 || file.indexOf('.git') > -1
    }
    let config = await fsExt.readdirRecursive(path.join(__dirname, '/../../'), judge, skip)
      .catch(err => reject(err))
    config = arrayExt.flatten(config)
    config = require(config[0])
    resolve(config.client)
  })
}

function setupStaticImports(config) {
  let url
  for (url in config.static) {
    app.use(url, express.static(path.join(__dirname, config.static[url])))
  }
  app.use('/emerald', express.static(path.join(__dirname, '/scripts/')))
}

/**
 * setupRoutes - Set up the routes that the client can use
 */
function setupRoutes() {
  let index, clientInPacket, clientOutPacket, serverInPacket, serverOutPacket
  // Root
  app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../main.html'))
  })
  // Publish a list of packets and each packet
  // app.get('/api/packets/client', function (req, res) {
  //   res.json(packetManager.packets.client)
  // })
  // for (index in packetManager.packets.client.in) {
  //   clientInPacket = packetManager.packets.client.in[index]
  //   app.get('/api/packets/client/in/' + clientInPacket + '.js', function (req, res) {
  //     res.sendFile(path.resolve(__dirname + "/../shared/packets/client/in/" + clientInPacket + ".js"))
  //   })
  // }
  // for (index in packetManager.packets.client.out) {
  //   clientOutPacket = packetManager.packets.client.out[index]
  //   app.get('/api/packets/client/out/' + clientOutPacket + '.js', function (req, res) {
  //     res.sendFile(path.resolve(__dirname + "/../shared/packets/client/out/" + clientOutPacket + ".js"))
  //   })
  // }
  // app.get('/api/packets/server', function (req, res) {
  //   res.json(Object.keys(packetManager.packets.server))
  // })
  // for (index in Object.keys(packetManager.packets.server.in)) {
  //   serverInPacket = Object.keys(packetManager.packets.server.in)[index]
  //   app.get('/api/packets/server/in/' + serverInPacket + ".js", function (req, res) {
  //     res.sendFile(path.resolve(__dirname + "/../shared/packets/server/in/" + serverInPacket + ".js"))
  //   })
  // }
  // for (index in Object.keys(packetManager.packets.server.out)) {
  //   serverOutPacket = Object.keys(packetManager.packets.server.out)[index]
  //   app.get('/api/packets/server/out/' + serverOutPacket + ".js", function (req, res) {
  //     res.sendFile(path.resolve(__dirname + "/../shared/packets/server/out/" + serverOutPacket + ".js"))
  //   })
  // }
}

init()
