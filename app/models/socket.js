var topics = {},/*id-> topic*/
	stranger = {};/* my id-> his socket*/
exports.open = function(io) {
	io.sockets.on('connection', function(socket){
		updateTopics();
		socket.on('new topic', function(data, callback){
			socket.topic = data;
			topics[socket.id] = data;
			updateTopics();
			console.log(socket.id + ": " + data);
			callback(true);
		});
		
		function updateTopics(){
			io.sockets.emit('topics', topics);
			console.log('topic updated!');
		}
		socket.on('topic clicked', function(data, callback){
			stranger[socket.id] = io.sockets.connected[data];
			stranger[data] = socket;
			
			callback(topics[data]);/*回傳主題名稱*/
			io.sockets.connected[data].emit('guest coming', null);/*通知主題發起人*/
			delete topics[data];
			updateTopics();
		});
		socket.on('send message', function(data) {
			var msg = data.trim();
			stranger[socket.id].emit('new message', msg);
			console.log(socket.id+' '+msg);
			//socket.broadcast.emit('new message', data); /*sent to everyone except the sender*/
		});
		
		socket.on('disconnect', function(data) {
			
			if(!socket.topic && !stranger[socket.id]) return;
			if(socket.topic){
				delete topics[socket.id];
				updateTopics();
			}
			if(stranger[socket.id]){ /*聊天到一半離開*/
				var strangerId = stranger[socket.id].id;
				stranger[socket.id].emit('guest left', null);
				delete stranger[socket.id];
				delete stranger[strangerId];
			}
			
			
			//nicknames.splice(nicknames.indexOf(socket.nickname),1);
		});
	});
}