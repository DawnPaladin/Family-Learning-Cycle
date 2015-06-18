function floatControl($control, $aor) { // Make a control float over the page, but only when a particular element (the Area of Responsibility) is onscreen
	jQuery(window).scroll(function(){
		var scrollTop = jQuery(window).scrollTop(); // distance between the top of the window and the top of the page
		var screenHeight = Math.round(jQuery(window).height());
		var theoreticalBoxPosition = scrollTop + screenHeight;
		var aorOffset = Math.round($aor.offset().top);
		var aorHeight = Math.round($aor.height());
		var aorTop = aorOffset;
		var aorBottom = aorOffset + aorHeight;
		if (theoreticalBoxPosition > aorTop && theoreticalBoxPosition < aorBottom) {
			$control.addClass('hover');
		} else {
			$control.removeClass('hover');
		}
	});
}
floatControl(jQuery('#Robert-toy-wrapper .storyShuttleBox'), jQuery('#Robert-toy-wrapper'));
floatControl(jQuery('#Carpenter-toy-wrapper .storyShuttleBox'), jQuery('#Carpenter-toy-wrapper'));

jQuery('.colorBox').each(function(){
	var This = jQuery(this);
	var control = This.find('input');
	var color = control.val();
	This.css('background-color', color);
});
