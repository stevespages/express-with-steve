$("document").ready(function() {
	$("#hidden-count").val(0);
	$("#result").text(0);
	$("#counter").click(function() {
	  var hiddenCountValue = $("#hidden-count").val();
	  hiddenCountValue = parseInt(hiddenCountValue);
	  $("#hidden-count").val(1 + hiddenCountValue);
	  $("#result").text(1 + hiddenCountValue);
	});
})
