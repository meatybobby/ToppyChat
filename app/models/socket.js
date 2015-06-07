var topics = {},/*id-> topic*/
	stranger = {};/* my id-> his socket*/
var cookieParser = require('cookie-parser'),passport = require('passport');
exports.open = function(server,mongoStore) {
	var io = require('socket.io').listen(server);
	io.use(function(socket,next) {
		cookieParser('ilovetoppychat')(socket.request,null,function(err) {
			var sessionId = socket.request.signedCookies['connect.sid'];
			mongoStore.get(sessionId,function(err,session) {
				socket.request.session=session;
				passport.initialize()(socket.request,null,function() {
					passport.session()(socket.request,null,function() {
						if(socket.request.user) {
							next(null,true);
						}
						else {
							next(new Error('User is not authenticated'), false);
						}
					});
				});
			});
		});
	});
	io.sockets.on('connection', function(socket) {
		updateTopics();
		socket.on('new topic', function(data, callback){
			socket.topic = data;
			topics[socket.id] = data;
			updateTopics();
			callback(true);
		});
		
		function updateTopics() {
			io.sockets.emit('topics', topics);
			console.log('topic updated!');
		}
		socket.on('topic clicked', function(data, callback) {
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