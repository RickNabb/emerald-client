
module.exports = (config, utils, debug, fs, path, promise) => {

  const arrayExt = require(__dirname + '/../utils/arrayExt.js')()
  const fsExt = require(__dirname + '/../utils/fsExt.js')(debug, fs, path, promise, arrayExt)
  const packetManager = require(__dirname + '/../packetManager.js')(config, debug, fs, promise, fsExt)
  // const requirejs = require('requirejs')

  let tests = [
    prepareTempFileStructure,
    testCreateOutgoingPacket,
    testCreateResponsePacket,
    testCreateEmptyPackets
  ]

  const dirs = ['.temp/', '.temp/.temp2/', '.temp/.temp3/', '.temp/.temp3/.temp4/']
  const files = { 
    '.temp/file.js': "This is the first text file.\nBlah blah blah.",
    '.temp/file2.txt': "This is another text file... the second one! Blah blah blah.",
    '.temp/.temp2/file3.png': "This is supposed to be a png file but you know there's not a whole lot we can do for that.",
    '.temp/.temp3/file4.txt': "Yet another text file",
    '.temp/.temp3/.temp4/file5.js': "[emeraldPacket]\n\ndefine(function require() {\n\nconst id='testpacket'\nfunction send(socket, data) {\n}})"
  }

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting Packet Manager Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping Packet Manager Tests ---")
      resolve()
    })
  }

  function prepareTempFileStructure() {
    return utils.prepareTempFileStructure(dirs, files)
  }

  function testCreateOutgoingPacket() {
    return new Promise(async (resolve, reject) => {
      const packetname = 'testPacket1'
      const packet = await packetManager.createOutgoingPacket(packetname)
      const pass = packet.id === 'testPacket1' && packet.send
      if (pass) resolve('Create Outgoing Packet Test: SUCCESS')
      else reject('Create Outgoing Packet Test: FAILED (object misformed: ' + JSON.stringify(packet) + ')')
    })
  }

  function testCreateResponsePacket() {
    return new Promise(async (resolve, reject) => {
      const packetname = 'testPacket1'
      const packet = await packetManager.createResponsePacket(packetname)
      const pass = packet.id === 'testPacket1Response' && packet.setResponseHandler && packet.handlePacket
      if (pass) resolve('Create Response Packet Test: SUCCESS')
      else reject('Create Response Packet Test: FAILED (object misformed: ' + JSON.stringify(packet) + ')')
    })
  }

  function testCreateEmptyPackets() {
    return new Promise(async (resolve, reject) => {
      const packets = await packetManager.createEmptyPackets()
      let pass = true, packet
      for (packet in config.emptyPackets) {
        packet = config.emptyPackets[packet]
        pass = pass && packets.out[packet] && packets.in[packet + 'Response']
      }
      packetManager.packets = packets
      if (pass) resolve('Create Empty Packets Test: SUCCESS')
      else reject('Create Empty Packets Test: FAILED (not all packets created correctly: ' + JSON.stringify(packets) + ')')
    })
  }

  function testCreatePacketManifest() {
    return new Promise(async (resolve, reject) => {
      let manifest
      await packetManager.createPacketManifest()
      manifest = JSON.parse(await fsExt.readfilePromise('./.packetManifest.json', 'utf-8'))
    })
  }

  function testIncomingPacketToJavascript() {
    return new Promise(async (resolve, reject) => {
      let packet, packetJS
      if (Object.keys(packetManager.packets.in).length > 0 ||
          Object.keys(packetManager.emptyPackets.in).length > 0) {
        packet = packetManager.packets.in[0] !== undefined ? packetManager.packets.in[0] : packetManager.emptyPackets.in[0]
        packetJS = packetManager.incomingPacketAsJavascript(packet)
        // requirejs()
        // TODO : Figure out all this requireJS shit
        resolve('Incoming Packet to Javascript Test: SUCCESS')
      } else {
        reject('Incoming Packet to Javascript Test: FAILED (no incoming packets to convert)')
      }
    })
  }

  function cleanUp() {
    return utils.cleanUp(dirs, files)
  }

  return {
    "run": run
  }
}
