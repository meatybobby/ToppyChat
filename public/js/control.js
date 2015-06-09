$(function () {
	$('#quitBtn').click(function(){
		//e.preventDefault();
		if(confirm('Are you sure?')) {
			location.reload();
		}
		return false;
	});
	
	/*$('ul.nav.navbar-nav li').click(function(){
		
		$(this).addClass('active');
	});*/
	
	
	$('.delete-btn').on('click', function(e){
		e.stopPropagation();
		var id = $(this).prop('id').slice(2);
		console.log("delete click!");
		if(confirm('確定刪除 '+id+' ?')) {
			
			$.ajax({
				url: '/friends/'+id,
				type: 'DELETE',
				success: function(result) {
					// Do something with the result
					//alert('成功刪除!');
					$('li#li-'+id).hide(100, function(){
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
 
