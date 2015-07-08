function floatControl($control, $aor) { // Make a control float over the page, but only when a particular element (the Area of Responsibility) is onscreen
	var $placeholder = $control.filter('.placeholder');
	var $original = $control.filter('.original');
	jQuery(window).scroll(function(){
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
			$original.css('opacity', 1);
			$placeholder.css('opacity', 0);
		} else {
			$original.css('opacity', 0);
			$placeholder.css('opacity', 1);
		}
	});
}
floatControl(jQuery('#Robert-toy-wrapper .storyShuttleBox'), jQuery('#Robert-toy-wrapper .canvas-container'));
floatControl(jQuery('#Carpenter-toy-wrapper .storyShuttleBox'), jQuery('#Carpenter-toy-wrapper .canvas-container'));

jQuery('.colorBox').each(function(){
	var This = jQuery(this);
	var control = This.find('input');
	var color = control.val();
	This.css('background-color', color);
});
