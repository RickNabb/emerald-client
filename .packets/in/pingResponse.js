define(function (require) {
	const id = 'pingResponse'
	function send (socket, data) { try { socket.emit(id, data) } catch (err) { console.log(err) } }
	return { "send": send, "id": id }
})