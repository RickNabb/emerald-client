define(function (require) {
	const id = 'getGuides'
	let responseHandler
	function handlePacket (data) { responseHandler(data) }
	function setResponseHandler(_responeHandler) { responseHandler = _responeHandler }
	function send (socket, data) { try { socket.emit(id, data) } catch (err) { console.log(err) } }
	return { "handlePacket": handlePacket, "setResponseHandler": setResponseHandler, "id": id, "send": send }
})