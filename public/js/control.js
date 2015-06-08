$(function () {
	$('#quitBtn').click(function(){
		//e.preventDefault();
		if(confirm('Are you sure?')) {
			location.reload();
		}
		return false;
	});
	
	$('ul.nav.navbar-nav li').click(function(){
		
		$(this).addClass('active');
	});
	
	
	$('.delete-btn').on('click', function(){
		var id = $(this).prop('id');
		$.ajax({
		url: '/friend/'+id,
		type: 'DELETE',
		success: function(result) {
			// Do something with the result
		}
	});
	
	
});
});
 
