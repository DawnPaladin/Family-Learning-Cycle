function floatControl($control, $aor, storyName) { // Make a control float over the page, but only when a particular element (the Area of Responsibility) is onscreen
	var $placeholder = $control.filter('.placeholder');
	var $original = $control.filter('.original');
	function determineBoxPosition() {
		var scrollTop = jQuery(window).scrollTop(); // distance between the top of the window and the top of the page
		var screenHeight = Math.round(jQuery(window).height());
		var boxHeight = Math.round($control.outerHeight());
		var boxDistanceFromScreenBottom = 15; // from CSS
		var boxUpperEdgeDistanceFromScreenBottom = boxHeight + boxDistanceFromScreenBottom;
		var theoreticalBoxPosition = scrollTop + screenHeight - boxUpperEdgeDistanceFromScreenBottom;
		var aorOffset = Math.round($aor.offset().top);
		var aorHeight = Math.round($aor.height());
		var aorTop = aorOffset;
		var aorBottom = aorOffset + aorHeight;
		if (theoreticalBoxPosition > aorTop && theoreticalBoxPosition < aorBottom) {
			$original.removeClass('hidden');
			$placeholder.addClass('hidden');
		} else {
			$original.addClass('hidden');
			$placeholder.removeClass('hidden');
		}
	}
	jQuery(window).scroll(determineBoxPosition);
	determineBoxPosition();

	$control.each(function(){ // There are two copies of the story box at any given time, one hidden.
		jQuery(this).on('HitFirstPage.'+storyName, function(event) {
			jQuery(this).find('.storyPrevBtn').prop("disabled", true);
		});
		jQuery(this).on('LeaveFirstPage.'+storyName, function(event) {
			jQuery(this).find('.storyPrevBtn').prop("disabled", false);
		});
		jQuery(this).on('HitLastPage.'+storyName, function(event) {
			jQuery(this).find('.storyNextBtn')
				.prop("disabled", true)
				.text("Done")
			;
		});
		jQuery(this).on('LeaveLastPage.'+storyName, function(event) {
			jQuery(this).find('.storyNextBtn')
				.prop("disabled", false)
				.text("Next >")
			;
		});
	});
}
jQuery(document).ready(function(){
	floatControl(jQuery('#Robert-toy-wrapper .storyShuttleBox'), jQuery('#Robert-toy-wrapper .canvas-container'), "Robert");
	floatControl(jQuery('#Carpenter-toy-wrapper .storyShuttleBox'), jQuery('#Carpenter-toy-wrapper .canvas-container'), "Carpenters");
});

jQuery('.colorBox').each(function(){
	var This = jQuery(this);
	var control = This.find('input');
	var color = control.val();
	This.css('background-color', color);
});
