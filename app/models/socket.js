var topics = {},/*id-> topic*/
	stranger = {};/* my id-> his socket*/
var cookieParser = require('cookie-parser'),passport = require('passport');
var User  = require('./user');
var Message = require('./message');
var onlineUser = {};
var online = [];
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
							onlineUser[socket.request.user.userid]=socket;
							online.push(socket.request.user.userid);
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
		var tempMessage = [];
		socket.emit('online user',online);
		updateTopics();
		io.sockets.emit('online',socket.request.user.userid);
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
		
		socket.on('invite friend',function(data) {
			console.log('invite sent to server');
			var strangeUser = stranger[socket.id].request.user;
			User.findOne({ 'userid' :  socket.request.user.userid }, function(err, user) {
				if(err) return;
				if(!user) return;
				if(!stranger[socket.id]) return;
				var newUser = user;
				if(user.friends.indexOf(strangeUser._id)!=-1) socket.emit('already friend',null);
				else stranger[socket.id].emit('friend request', null);
			});
		});
		
		socket.on('check friend',function (data, callback) {
			var strangeUser = stranger[socket.id].request.user;
			User.findOne({ 'userid' :  socket.request.user.userid }, function(err, user) {
				if(err || !user || !stranger[socket.id]) {
					callback(false);
					return;
				}
				if(user.friends.indexOf(strangeUser.userid)!=-1) {
					socket.emit('already friend',null);
					callback(false);
					return;
				}
				var newUser = user;
				newUser.friends.push(strangeUser.userid);
				newUser.save(function(err) {
					if (err){
						callback(false);
						throw err;
					}
				});
			});
			User.findOne({ 'userid' :  strangeUser.userid }, function(err, user) {
				if(err || !user || !stranger[socket.id]) {
					callback(false);
					return;
				}
				if(user.friends.indexOf(socket.request.user.userid)!=-1) {
					socket.emit('already friend',null);
					callback(false);
					return;
				}
				var newUser = user;
				newUser.friends.push(socket.request.user.userid);
				newUser.save(function(err) {
					if (err){
						callback(false);
						throw err;
					}
					else {
						callback(true);
						stranger[socket.id].emit('accepted', null);
					}
				});
			});
		});
		
		socket.on('fuck you', function() {
			stranger[socket.id].emit('fuck you',null);
		});
		
		socket.on('talk',function(data,id) {
			tempMessage.push(data);
			if(onlineUser[id])
				onlineUser[id].emit('receive',data);
		});
		
		socket.on('disconnect', function(data) {
			delete onlineUser[socket.request.user.userid];
			var find = online.indexOf(socket.request.user.userid);
			online.splice(find,1);
			io.sockets.emit('offline',socket.request.user.userid);
			if(!socket.topic && !stranger[socket.id]) return;
			if(socket.topic) {
				delete topics[socket.id];
				updateTopics();
			}
			if(stranger[socket.id]){ /*聊天到一半離開*/
				var strangerId = stranger[socket.id].id;
				stranger[socket.id].emit('guest left', null);
				delete stranger[socket.id];
				delete stranger[strangerId];
				
			}
			
		});
	});
}