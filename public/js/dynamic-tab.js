var inTabs = [];
$(function () {
	
	
	$('ul#friendList li:not(:first-of-type)').on('click', function () { // Click event on the "Add Tab" button
		var nbrLiElem = ($('ul#myTab li').length) - 1; // Count how many <li> there are (minus 1 because one <li> is the "Add Tab" button)
		var friendName = $(this).find('.friend').html();
		//console.log(inTabs);
		if(inTabs.indexOf(friendName)== -1 ){ //not added
			inTabs.push(friendName);
			$('ul#myTab li:last-child').after(
				'<li role="presentation" id="li' + friendName + '">' + 
					'<a href="#' + friendName + '" role="tab" data-toggle="tab" aria-controls="'+friendName+'">'
					+friendName+ ' <button type="button" class="btn btn-info btn-xs">'+
					'<span class="glyphicon glyphicon-remove"></span></button></a></li>'
			);
			
			
			$('li#li'+friendName+' button').on('click' , function(e){
				
				removeTab(friendName);
				var idx = inTabs.indexOf(friendName);
				inTabs.splice(idx, 1);
				if(inTabs.length==0) {
					console.log('all empty!');
					//if(!$('li#li1').hasClass('active')){
						//console.log("topic");
						$('div#tab1').addClass('active');
						$('div#tab1').addClass('in');
						$('li#li1').addClass('active');
					//}
					
					//$('div#tab1').show();
				}
				
			});
		
			/**the content (對話紀錄)*/
			
			var chatWindow = '<div class="panel panel-default chatWrap-friend">'+
								'<div class="chat-friend" id="'+friendName+'"></div>'+
									'<div id="send-message-friend" class="form-inline">'+
										'<input class="form-control" id="message-friend" autocomplete="off" />'+
										'<button type="button" class="btn btn-default sendMsg-friend" id="'+friendName+'">傳送</button>'+
									'</div>'+
							 '</div>';
			
			$('div.tab-content div[role="tabpanel"]:last-child').after('<div role="tabpanel" class="tab-pane fade in" id="' + friendName + '">'+ chatWindow +'</div>');
			
		}
			
	});
});
 
function removeTab(liElem) { // Function remove tab with the <li> number
		$('ul#myTab > li#li' + liElem).fadeOut(100, function () { 
			$(this).removeClass('active');
			$(this).remove(); // Remove the <li></li> with a fadeout effect
			//$('#messagesAlert').text(''); // Empty the <div id="messagesAlert"></div>
		});
		
		$('div.tab-content div#' + liElem).remove(); // Also remove the correct <div> inside <div class="tab-content">
		
		
		
		/*$('ul#myTab > li').not('#last').not('#li' + liElem).each(function(i){ // Select all <li> from <ul id="myTab"> except the last (with is the "Add Tab" button) and without the one we deleted
			var getAttr = $(this).attr('id').split('li'); // We get the <li> div attribute
			$('ul#myTab li#li' + getAttr[1]).attr('id', 'li' + (i + 1)); // We change the div attribute of all <li>: the first is 1, then 2, then 3...
			
			var tabContent = 'Tab ' + (i + 1); // 
			if (getAttr[1] != 1) tabContent += ' <button type="button" class="btn btn-warning btn-xs" onclick="removeTab(' + (i + 1) + ');"><span class="glyphicon glyphicon-remove"></span></button>';
			$('#myTab a[href="#tab' + getAttr[1] + '"]').html(tabContent) // tabContent variable, inside the <li>. We change the number also, 1, then 2, then3...
														.attr('href', '#tab' + (i + 1)); // Same for the href attribute
			
			$('div.tab-content div#tab' + getAttr[1]).html('<p>Content tab ' + (i + 1) + '</p>') // We do the same for all <div> from <div class="tab-content">: we change the number: 1, then 2, then 3...
													.attr('id', 'tab' + (i + 1)); // Same for the id attribute
													
			$('#displayElem').html(i+1); // This line is not required (I just display, inside the <div id="messagesAlert"></div> markup, how many tabs there is)
		});*/
		
		/*$('#messagesAlert').html('<div class="alert alert-danger" id="alertFadeOut">This tab has been deleted!</div>'); // Message saying that the tab has been deleted*/
}