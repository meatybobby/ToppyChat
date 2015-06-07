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
});
 
