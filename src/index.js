var gui = require('nw.gui');

document.addEventListener('DOMContentLoaded', function () {
	var ping = require('net-ping');

	var pingTimes = 0;
	var latestPingTime = new Date();
	var pingHistory = [];

	var target = '8.8.8.8';
	var refreshRate = 20;

	var session = ping.createSession({
		networkProtocol: ping.NetworkProtocol.IPv4,
	});

	setInterval(doPing, 1000);
	setInterval(refresh, 1000 / refreshRate);

	function doPing() {
		var pingSession = pingTimes;

		session.pingHost(target, function (error, target, sent, received) {
			if (error) {
				pingHistory[pingSession] = error.toString();
			} else {
				pingHistory[pingSession] = received - sent;
			}
			console.log(pingHistory[pingSession]);
		});

		pingTimes++;
		latestPingTime = new Date();
	}

	function refresh() {

	}
});

window.addEventListener('keydown', function (event) {
	if (event.which === 123) {
		gui.Window.get().showDevTools();
	}
});
