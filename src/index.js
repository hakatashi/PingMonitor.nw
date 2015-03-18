var gui = require('nw.gui');
var pingHistory = [];
var pingSentTimeHistory = [];
var bars = [];

// ES6 Math.log10 polyfill
Math.log10 = Math.log10 || function (x) {
	return Math.log(x) / Math.LN10;
};

document.addEventListener('DOMContentLoaded', function () {
	var ping = require('net-ping');

	var pingTimes = 0;
	var latestPingTime = new Date();

	var target = '8.8.8.8';
	var refreshRate = 30;
	var interval = 1000;
	var barInterval = 15;
	var barWidth = 10;

	var session = ping.createSession({
		networkProtocol: ping.NetworkProtocol.IPv4,
	});

	var draw = Snap('#graph');

	setInterval(doPing, interval);
	setInterval(refresh, 1000 / refreshRate);

	function doPing() {
		var pingSession = pingTimes;

		session.pingHost(target, function (error, target, sent, received) {
			if (error) {
				pingHistory[pingSession] = error.toString();
			} else {
				pingHistory[pingSession] = received - sent;
			}
		});

		pingTimes++;
		latestPingTime = pingSentTimeHistory[pingSession] = new Date();
	}

	function refresh() {
		var now = new Date();
		var totalTime = pingTimes * interval + (now - latestPingTime);
		var scrollLeft = totalTime / interval * barInterval;
		var screenEl = document.getElementById('graph');
		var barsEl = screenEl.querySelector('g#bars');
		var screenWidth = screenEl.clientWidth;
		var displayingBarNumber = Math.max(0, Math.floor((scrollLeft - screenWidth) / barInterval));

		bars.forEach(function (bar, index) {
			if (bar && index < displayingBarNumber) {
				bars[index].remove();
				delete bars[index];
			}
		});

		for (var i = displayingBarNumber; i < pingTimes; i++) {
			var id = 'bar-' + i;
			var x = screenWidth - scrollLeft + i * barInterval;

			if (typeof pingHistory[i] === 'undefined') {
				updateBar(now - pingSentTimeHistory[i]);
			} else if (typeof pingHistory[i] === 'string') {
				updateBar(10000);
			} else {
				updateBar(pingHistory[i]);
			}

			function updateBar(ms) {
				var percentage = Math.log10(ms) / 4 * 100;
				var attr = {
					x: x,
					y: (100 - percentage) + '%',
					width: barWidth,
					height: percentage + '%',
					fill: 'black',
				};

				if (!bars[i]) {
					bars[i] = draw.rect(attr.x, attr.y, attr.width, attr.height);
				} else {
					bars[i].attr(attr);
				}
			}
		}
	}
});

window.addEventListener('keydown', function (event) {
	if (event.which === 123) {
		gui.Window.get().showDevTools();
	}
});
