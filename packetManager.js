/**
* packetManager.js
* This manager should serve to handle the collection of packet information
* for the emerald client.
*/

module.exports = (config, debug, fs, promise, fsExt, objExt) => {

  const readline = require('readline')
  const packets = {in: {}, out: {}}
  let socket
  let emptyPackets

  function init() {
    return new Promise(async (resolve, reject) => {
      emptyPackets = await createEmptyPackets()
        .catch(err => reject(err))
      // TODO : Maybe just assign these inside of the createEmptyPackets function
      // to save time if it gets intensive
      Object.keys(emptyPackets.out).map(key => packets.out[key] = emptyPackets.out[key])
      Object.keys(emptyPackets.in).map(key => packets.in[key] = emptyPackets.in[key])
      await createPacketManifest()
        .catch(err => reject(err))
      resolve('Packet Manager Started')
    })
  }

  function send(packetId, data) {
    packets.out[packetId].send(data)
  }

  /**
   * Create all of the empty packets specified in the Emerald configuration.
   * @return {Object}  A collection of all the packets we create
   */
  function createEmptyPackets() {
    return new Promise(async (resolve, reject) => {
      let packet
      let outgoingPromises, responsePromises = []
      let outgoingPackets, responsePackets
      const packets = {in: {}, out: {}}
      for (packet in config.emptyPackets) {
        packet = config.emptyPackets[packet]
        packets.out[packet] = await createOutgoingPacket(packet)
        packets.in[packet + 'Response'] = await createResponsePacket(packet)
      }
      resolve(packets)
    })
  }

  /**
   * Create an empty outgoing packet object.
   * @param  {String} packetname The name of the packet - also serves as the id.
   * @return {Object} Resolve to the empty outgoing packet skeleton.
   */
  function createOutgoingPacket(packetname) {
    return new Promise((resolve, reject) => {
      resolve({
        id: packetname,
        send: (socket, data) => {
          try {
            socket.emit(this.id, data)
          } catch (err) {
            console.log('Error: ' + err)
          }
        }
      })
    })
  }

  /**
   * Create an empty response packet object.
   * @param  {String} packetname The name of the packet - also serves as the id.
   * @return {Object} Resolve to the empty packet response skeleton.
   */
  function createResponsePacket(packetname) {
    return new Promise((resolve, reject) => {
      resolve({
        id: packetname + 'Response',
        responseHandler: null,
        handlePacket: (data) => { this.responseHandler(data) },
        setResponseHandler: (_responeHandler) => { this.responseHandler = _responeHandler }
      })
    })
  }

  /**
   * Collect all the packet files in the parent directories.
   */
  function collectPackets() {
    return new Promise(async (resolve, reject) => {
      const packets = {in: {}, out: {}}
      const promises = []

      // This does not have to search the directory since what we do with the packets
      // is really just in the view model. We should just read from a manifest
      let packetFiles = await fsExt.readdirRecursive('../../', isPacketFile)
    })
  }

  /**
   * Determine whether or not a given file is an Emerald packet file.
   * @param  {String} file The path to a given file to judge.
   * @return {Boolean}     True if the file is formatted as an Emerald packet,
   * false otherwise.
   */
  function isPacketFile(file) {
    return new Promise((resolve, reject) => {
      readline.createInterface({
        input: fs.createReadStream(file)
      })
      readline.on('line', (line) => {
        if (line === '[emeraldPacket]')
          resolve(file)
      })
      resolve()
    })
  }

  /**
   * Write a packet manifest file for the client proper to read.
   * @return {Object}  A promise containing the file write operation for the
   * packet manifest.
   */
  function createPacketManifest() {
    const _packets = {in: [], out: []}
    let packet
    for (packet in packets.in) {
      _packets.in.push(packet)
    }
    for (packet in packets.out) {
      _packets.out.push(packet)
    }
    return fsExt.writefilePromise('./.packetManifest.json', JSON.stringify(_packets))
  }

  /**
   * Write all of the empty packets out as javascript files for the client to consume.
   * @param  {Array} packets An array of packets to convert to javascript text. This object
   * MUST be in the format {in: {}, out: {}}
   * @return {type}      description
   */
  function convertPacketsToJavascript(packets) {
    const jsPackets = {in: {}, out: {}}
    Object.keys(packets.in).map(key => jsPackets.in[key] = incomingPacketAsJavascript(packets.in[key]))
    Object.keys(packets.out).map(key => jsPackets.out[key] = outgoingPacketAsJavascript(packets.out[key]))
    return jsPackets
  }

  /**
   * Write an incoming packet as a javascript file for the client to consume.
   * @param  {Object} packet   The packet object that you want to write.
   * @return {Object}          A Promise to write the file if the packet is valid.
   * If the packet does not have an 'id' field, return null.
   */
  function incomingPacketAsJavascript(packet) {
    if (packet.id === undefined) return null

    let contents =
    'define(function (require) {\n' +
    '\tconst id = \'' + packet.id + '\'\n' +
    '\tfunction send (socket, data) { try { socket.emit(id, data) } catch (err) { console.log(err) } }\n' +
    '\treturn { "send": send, "id": id }\n' +
    '})'
    return contents
  }

  /**
   * Write an outgoing packet as a file for the client to consume.
   * @param  {Object} packet   The packet object that you want to write.
   * @return {Object}          A Promise to write the file if the packet is valid.
   * If the packet does not have an 'id' field, return null.
   */
  function outgoingPacketAsJavascript(packet) {
    if (packet.id === undefined) return null

    let contents =
      'define(function (require) {\n' +
      '\tconst id = \'' + packet.id + '\'\n' +
      '\tlet responseHandler\n' +
      '\tfunction handlePacket (data) { responseHandler(data) }\n' +
      '\tfunction setResponseHandler(_responeHandler) { responseHandler = _responeHandler }\n' +
      '\tfunction send (socket, data) { try { socket.emit(id, data) } catch (err) { console.log(err) } }\n' +
      '\treturn { "handlePacket": handlePacket, "setResponseHandler": setResponseHandler, "id": id, "send": send }\n' +
      '})'
    return contents
  }

  return {
    "packets": packets,
    "emptyPackets": emptyPackets,
    "createOutgoingPacket": createOutgoingPacket,
    "createResponsePacket": createResponsePacket,
    "createEmptyPackets": createEmptyPackets,
    "createPacketManifest": createPacketManifest,
    "convertPacketsToJavascript": convertPacketsToJavascript,
    "incomingPacketAsJavascript": incomingPacketAsJavascript,
    "outgoingPacketAsJavascript": outgoingPacketAsJavascript,
    "init": init,
    "socket": socket
  }
}
