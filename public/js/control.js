var leaveConfirm = '確定離開並清除主題與聊天紀錄？';
var topicOn = false;
var quitBtnClicked = false;
var navClicked = false;
$(function () {
	$('#show-friend').click(function(){
		$(this).addClass('open').hide();
		$('#friend-list').addClass('cbp-spmenu-open');
	});
	$('#close-friend-list').click(function(){
		$('#friend-list').removeClass('cbp-spmenu-open');
		$('#show-friend').removeClass('open').show();
	});
	$('.tab-content').on('click', function(){
		//console.log('other area clicked');
		$('#friend-list').removeClass('cbp-spmenu-open');
		$('#show-friend').removeClass('open').show();
	});
	/*$('#show-friend').on('click', function(e){
		console.log('show friend clicked');
		$.ajax({
				url: '/friends',
				type: 'GET',
				success: function(result) {
					// Do something with the result
					//alert('成功刪除!');
					console.log(result);
				}, 
				error: function(){
					alert('error');
				}
		});
	});*/
	
	$('#quitBtn').click(function(){
		//e.preventDefault();
		quitBtnClicked = true;
		if(confirm(leaveConfirm)) {
			location.reload();
		}
		return false;
	});
	
	var $topicLi = $('ul.nav.navbar-nav li#li-topic');
	$('ul.nav.navbar-nav li a').click(function(e){
		navClicked = true;
		if($(this).prop('id')!='online-number' && $(this)!==$topicLi){
			if(topic_opened()){
				if(!confirm(leaveConfirm)) {
					return false;
				}
			}
		}
		
	});
	//if(topic_opened()){
		var myEvent = window.attachEvent || window.addEventListener;
		var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compatible

		myEvent(chkevent, function(e) { // For >=IE7, Chrome, Firefox
           if(topic_opened() && !quitBtnClicked && !navClicked){
				var confirmationMessage = '有聊天還在進行，確定要離開並清除紀錄？';  // a space
				(e || window.event).returnValue = confirmationMessage;
				return confirmationMessage;
		   }
		});
	//}

	function topic_opened(){
		return $topicLi.hasClass('active') && topicOn;
	}
	/*$('ul.nav.navbar-nav li').click(function(){
		
		$(this).addClass('active');
	});*/
	/**取得好友暱稱*/
	$.ajax({
		url: '/friends-json',
		type: 'GET',
		success: function(result) {
			// Do something with the result
			//alert('成功刪除!');
			//console.log(result);
			for(var i=0; i<result.length; i++) {
				id_to_nick[result[i].userid] = result[i].nickname;
				$('#li-'+result[i].userid+' .nickname').html(result[i].nickname);//好友列表
				$('td#nick_'+result[i].userid).html(result[i].nickname);//好友管理表格
			}
			//console.log(id_to_nick);
		}			
	});
	
	
	/**刪除好友*/
	$('.delete-btn').on('click', function(e){
		e.stopPropagation();
		e.preventDefault();
		var id = $(this).prop('id').slice(2);
		console.log("delete click!");
		if(confirm('確定刪除 '+id_to_nick[id]+' ?')) {
			
			$.ajax({
				url: '/friends/'+id,
				type: 'DELETE',
				success: function(result) {
					// Do something with the result
					//alert('成功刪除!');
					$('tr#tr-'+id).hide(100, function(){
						console.log('hide tr');
						$(this).remove();
					});
				}			
			});
		}
		return false;
	
	});
});
function scrollToBottom($chat){
				
	$chat.scrollTop($chat[0].scrollHeight);
}
function escapeHtml(str) {
	if (typeof(str) == "string") {
		str = str.replace(/&/g, "&amp;"); /* must do &amp; first */
		str = str.replace(/"/g, "&quot;");
		str = str.replace(/'/g, "&#039;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/>/g, "&gt;");
	}
	return str;
}
 
