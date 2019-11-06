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
			jQuery(this).find('.story-prev-btn').attr('disabled', true);
			jQuery(this).find('.story-prev-btn img').attr('src', 'images/prev-btn-disabled.png');
		});
		jQuery(this).on('LeaveFirstPage.'+storyName, function(event) {
			jQuery(this).find('.story-prev-btn').attr('disabled', false);
			jQuery(this).find('.story-prev-btn img').attr('src', 'images/prev-btn.png');
		});
		jQuery(this).on('HitLastPage.'+storyName, function(event) {
			jQuery(this).find('.story-next-btn img').attr('src', 'images/next-scrolldown-btn.png').attr('alt', "Done (scroll down)");
			jQuery(this).find('.scroll-down-arrow').show();
			jQuery(this).removeClass('active');
		});
		jQuery(this).on('LeaveLastPage.'+storyName, function(event) {
			jQuery(this).find('.story-next-btn img').attr('src', 'images/next-btn.png').attr('alt', "Next");
			jQuery(this).find('.scroll-down-arrow').hide();
			jQuery(this).addClass('active');
		});
	});
}
jQuery(document).ready(function(){
	floatControl(jQuery('#Robert-toy-wrapper .story-shuttle-box'), jQuery('#Robert-toy-wrapper .canvas-container'), "Robert");
	floatControl(jQuery('#Carpenter-toy-wrapper .story-shuttle-box'), jQuery('#Carpenter-toy-wrapper .canvas-container'), "Carpenters");
	floatControl(jQuery('#sandbox-toy-wrapper .story-shuttle-box'), jQuery('#sandbox-toy-wrapper .canvas-container'), "Sandbox");
});

jQuery('.color-box').each(function(){
	var This = jQuery(this);
	var control = This.find('input');
	var color = control.val();
	This.css('background-color', color);
});
