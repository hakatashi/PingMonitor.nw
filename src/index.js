var gui = require('nw.gui');

window.addEventListener('keydown', function (event) {
	if (event.which === 123) {
		gui.Window.get().showDevTools();
	}
});
