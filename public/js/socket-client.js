jQuery(function($){
			var socket = io.connect();
			var $topicForm = $('#createTopic');
			var $inputTopic = $('#inputTopic');
			var $msgForm = $('#send-message');
			var $msgBox = $('#message');
			var $chat = $('#chat');
			var $topics = $('#topics');
			var $addBtn = $('#addBtn');
			var $sendBtn = $('#sendMsg');
			
			socket_ref = socket; /**for the socket emit in dynamic-tab.js*/
			
			/**看誰上線*/
			socket.on('online', function(data){
				$('nav#friend-list a.friend-list-item .signal').removeClass('online');
				for(var i=0; i<data.length; i++) {
					$('nav#friend-list a.friend-list-item #signal-'+data[i]).addClass('online');
				}
				$('li #online-number').html("在線人數： "+data.length);
			});
			
			/**跟朋友聊天*/
			$('.tab-content').on('keypress', '.chatWrap-friend #message-friend', function(e){
				if(e.which==13){
					$(this).parent().find('.sendMsg-friend').trigger('click');
				}
			});
			$('.tab-content').on('click', '.chatWrap-friend .sendMsg-friend', function(e){
				//console.log($(this).prop('id'));
				var id = $(this).prop('id').slice(5);
				var $chatFriendBox = $(this).parent().parent().find('.chat-friend');
				var $msgFriend = $(this).parent().find('#message-friend');
				if($msgFriend.val()!=''){
					var msgTxt = $msgFriend.val();
					var item=$('<p class="triangle-isosceles right msg you-msg">' + escapeHtml(msgTxt) + '</p>').hide().fadeIn(200);
					$chatFriendBox.append(item);
					scrollToBottom($chatFriendBox);
					socket.emit('talk to friend', {msg: msgTxt, id: id}  );
					$msgFriend.val('');
				}
				//$('.chat-friend '+id).append(id);
				
			});
			socket.on('receive from friend', function(data){
				$('nav#friend-list a#li-' + data.id).trigger('click');
				
				var msgTxt = escapeHtml(data.msg);
				//$('ul#friendList li#' + data.id)
				var $chatFriendBox = $('.chat-friend#cbox-' + data.id);
				//console.log($chatFriendBox);
				var item=$('<p class="triangle-isosceles left msg stranger-msg">' + msgTxt + '</p>').hide().fadeIn(200);
				$chatFriendBox.append(item);
				scrollToBottom($chatFriendBox);
				//console.log('receive from friend id:' + data.id+'   msg: '+data.msg);
			});
			$topicForm.submit(function(e){
				e.preventDefault();
				if( $inputTopic.val().length > 30){
					alert('請輸入30字以內！');
				}
				else if($inputTopic.val()!=''){
					var topicStr = $inputTopic.val();
					socket.emit('new topic', $inputTopic.val(), function(data){
						//console.log("topic created!");
						$('#createWrap').hide();
						$('#topicWrap').hide();
						$('#chatWrap').show();
						var str = '已建立主題：<div class="topic">'+escapeHtml(topicStr)+'</div><p>等待陌生人...</p>'
						topicOn = true;
						$chat.html(str);
					});
				}
				
				$inputTopic.val('');
			});
			
			$addBtn.click(function() {
				console.log("按下加入好友按鈕");
				socket.emit('invite friend',null);
				$addBtn.prop('disabled', true);
				$chat.append('<div class="leave"><p class="leave-msg">發出好友邀請...</p></div>');
				scrollToBottom($chat);
			});
			
			socket.on('accepted', function(data){
				$chat.append('<div class="leave"><p class="leave-msg">已和對方成為好友！</p></div>');
				/*var newFriendStr = '';
				$('#friendList li:last-child').after(newFriendStr);*/
				scrollToBottom($chat);
			});
			
			socket.on('already friend', function(data){
				$chat.append('<div class="leave"><p class="leave-msg">你們已經是好友囉，真巧。</p></div>');
				scrollToBottom($chat);
			});
			
			socket.on('friend request', function(data){
				$addBtn.prop('disabled', true);
				$chat.append('<div class="leave"><p class="leave-msg">對方發出好友邀請</p>'+
					'<button class="btn btn-danger" id="agreeBtn">同意</button>  ' + 
					'<button class="btn btn-danger" id="disagreeBtn">拒絕</button>' + 
					'</div>');
				scrollToBottom($chat);
				$('#agreeBtn').on('click', function(){
					console.log("agree clicked");
					socket.emit('check friend', null, function(data){
						console.log("check friend callback");
						if(data===false){
							$chat.append('<div class="leave"><p class="leave-msg">加入好友失敗</p></div>');
							scrollToBottom($chat);
						} else{
							$chat.append('<div class="leave"><p class="leave-msg">已加入好友</p></div>');
							scrollToBottom($chat);
						}
						$('#agreeBtn').hide();
						$('#disagreeBtn').hide();
					});
				});
				$('#disagreeBtn').on('click', function(){
					socket.emit('fuck you', null);
					$chat.append('<div class="leave"><p class="leave-msg">您已拒絕邀請</p></div>');
					$('#agreeBtn').hide();
					$('#disagreeBtn').hide();
					scrollToBottom($chat);
				});
			});
			
			socket.on('fuck you', function(data){
				$chat.append('<div class="leave"><p class="leave-msg">對方拒絕您的邀請</p></div>');
				scrollToBottom($chat);
			});
			
			socket.on('topics', function(data){
				var html = '';
				var len = Object.keys(data).length;
				var ids = Object.keys(data);
				
				for(i=0; i<len; i++){
					var tpc = data[ids[i]];
					html += '<div class="topic" id="'+ ids[i] +'">' + escapeHtml(tpc) + '</div>';
				}
				$topics.html(html);
			});
			
			$('#topics').on('click','div.topic', function(){
				console.log("a topic clicked!");
				var id = $(this).prop('id');
				socket.emit('topic clicked', id, function(data){
					$('#createWrap').hide();
					$('#topicWrap').hide();
					$('#chatWrap').show();
					$chat.html('您已進入：<div class="topic">' + escapeHtml(data) + '</div><br/>');
					topicOn = true;
					$msgBox.prop('disabled', false);
					$addBtn.prop('disabled', false);
					$sendBtn.prop('disabled', false);
				});
			});
			
			socket.on('guest coming', function(data){/**主題被連入*/
				$msgBox.prop('disabled', false);
				$chat.append('有人來囉~開始聊天吧 :D<br/>');
				$addBtn.prop('disabled', false);
				$sendBtn.prop('disabled', false);
			});
			$msgForm.submit(function(e){/**發訊息*/
				e.preventDefault();
				if($msgBox.val()!=''){
					socket.emit('send message',$msgBox.val());
					//$chat.append('<span class="You-msg">You: </span>' + $msgBox.val() + '<br/>')
					var msg = escapeHtml($msgBox.val());
					var item = $('<p class="triangle-isosceles right msg you-msg">' + msg + '</p>').hide().fadeIn(200);
					$chat.append(item);
					scrollToBottom($chat);
				}
				$msgBox.val('');
			});
			socket.on('new message', function(data){/**收到訊息*/
				var msg = escapeHtml(data);
				//$chat.append('<span class="stranger-msg">Stranger: </span>' + msg + '<br/>');
				var item = $('<p class="triangle-isosceles left msg stranger-msg">' + msg + '</p>').hide().fadeIn(200);
				$chat.append(item);
				scrollToBottom($chat);
			});
			socket.on('guest left', function(data){
				
				$chat.append('<div class="leave"><p class="leave-msg">陌生人已經離開</p> <button class="btn btn-danger" onclick="location.reload();">回主頁</button></div>');
				$msgBox.prop('disabled', true);
				$sendBtn.prop('disabled', true);
				$addBtn.prop('disabled', true);
				//$chat.append(' ');
				scrollToBottom($chat);
				// 
				
			});
			
			/**未讀訊息**/
			socket.on('unread', function(data) {
				
				unreadMsg = [];
				for(var i=0; i<data.length; i++) {
					unreadMsg.push(data[i]);
					
					$('.friend-list-item#li-'+data[i].sendid).addClass('unread');
					
				}
				//console.log(unreadMsg);
			});
			 
			/*socket.on('whisper', function(data){
				data = escapeHtml(data);
				$chat.append('<span class="whisper"><b>'+data.nick + ': </b>' +data.msg + '</span><br/>');
			});*/
		
			
		});