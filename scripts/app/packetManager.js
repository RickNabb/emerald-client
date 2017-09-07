/**
* packetManager.js
* The packet manager for the client side of the application
*/
define(function (require) {

  /**
   * A collection of all the packets the manager manages.
   */
  let packets

  /**
   * The socket we want to use for communcation.
   */
  let socket

  /**
   * init - Initialize the packet manager.
   */
  function init() {
    return new Promise((resolve, reject) => {

      // TODO : Instead of reading in pre-defined packet names from a manifest,
      // create JS files with packet name extensions and read them from the
      // client project here
      let packets = {"in": {}, "out": {}}, packet, index

      $.get('/packetManifest',
        function (data) {
          for (index in data.in) {
            packet = data.in[index]
            require(['../../packets/in/' + packet], (packetMod) => {
              packets.in[packetMod.id] = packetMod
              socket.on(packetMod.id, packetMod.handlePacket)
            })
          }
          for (index in data.out) {
            packet = data.out[index]
            require(['../../packets/out/' + packet], (packetMod) => {
              packets.out[packetMod.id] = packetMod
            })
          }
          resolve(packets)
        })
    })
  }

  /**
   * send - Send a packet to the server.
   *
   * @param  {string} packet The packet name.
   * @param  {object} data   JSON data to send.
   */
  function send(packet, data) {
    // debugging
    console.log("Sending data: " + JSON.stringify(data))

    packet.send(socket, data)
  }

  /**
   * Set the socket that we want to use and register packet handlers
   * to it.
   * @param  {object} _socket The socketIO instance.
   */
  // function setSocket(_socket) {
  //   let packet
  //   socket = _socket
  //   console.log(packets.in)
  //   for (packet in packets.in) {
  //     console.log('test')
  //     // socket.on(packet, packet.handlePacket)
  //   }
  // }
  return async (_socket) => {
    socket = _socket
    packets = await init()
    return {
      "packets": packets,
      "send": send
    }
  }
})
