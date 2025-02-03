var songster = () => {
	var elements = [
		['.rq25k', 'display', 'none'],
		['.D5an6', 'display', 'none'],
		['.Cto1rx', 'display', 'none'],
		['.Cip2pk', 'display', 'none'],
		['.Cek20l', 'display', 'none'],
	];

	var found = false;

	elements.forEach(([selector, styleProp, value]) => {
		var el = document.querySelector(selector);
		if (el && el.style[styleProp] !== value) {
			el.style[styleProp] = value;
			found = true;
		}
	});

	requestAnimationFrame(songster);
};

songster();
