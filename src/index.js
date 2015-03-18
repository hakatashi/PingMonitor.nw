var gui = require('nw.gui');

// ES6 Math.log10 polyfill
Math.log10 = Math.log10 || function (x) {
	return Math.log(x) / Math.LN10;
};

document.addEventListener('DOMContentLoaded', function () {
	var ping = require('net-ping');

	var pingTimes = 0;
	var latestPingTime = new Date();
	var pingHistory = [];
	var pingSentTimeHistory = [];
	var bars = [];
	var recentResults = [];

	var target = '8.8.8.8';
	var refreshRate = 30;
	var interval = 1000;
	var barInterval = 15;
	var barWidth = 10;
	var statuses = {
		blazing: {
			max: 20,
			color: '#0090B4',
		},
		sober: {
			max: 50,
			color: '#2B8276',
		},
		online: {
			max: 80,
			color: '#528752',
		},
		slow: {
			max: 200,
			color: '#B48C00',
		},
		lazy: {
			max: 600,
			color: '#B13E00',
		},
		drinking: {
			max: 2000,
			color: '#A90D00',
		},
		wasted: {
			max: 10000,
			color: '#2C005E',
		},
		offline: {
			max: Infinity,
			color: '#676767',
		},
	};

	var session = ping.createSession({
		networkProtocol: ping.NetworkProtocol.IPv4,
		timeout: 10000,
		retries: 0,
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
			updateStatus(pingHistory[pingSession]);
		});

		pingTimes++;
		latestPingTime = pingSentTimeHistory[pingSession] = new Date();
	}

	function updateStatus(result) {
		if (recentResults.length >= 5) recentResults.shift();
		recentResults.push(result);

		var sum = 0;
		var failure = 0;
		var success = 0;
		recentResults.forEach(function (result) {
			if (typeof result === 'string') {
				failure++;
			} else {
				success++;
				sum += Math.max(Math.log10(result), 0);
			}
		});

		var status = null;
		if (failure >= success) {
			status = 'offline';
		} else {
			var average = sum / success;

			var minimax = Infinity;
			Object.keys(statuses).forEach(function (name) {
				if (statuses[name].max < minimax && Math.log10(statuses[name].max) > average) {
					status = name;
					minimax = statuses[name].max;
				}
			});
		}

		document.querySelector('body').style.background = statuses[status].color;
		document.getElementById('status').textContent = status;
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
				var percentage = Math.max(0, Math.log10(ms) / 4 * 100);
				var attr = {
					x: x,
					y: (100 - percentage) + '%',
					width: barWidth,
					height: percentage + '%',
					fill: '#ff591d',
				};

				if (!bars[i]) {
					bars[i] = draw.rect(attr.x, attr.y, attr.width, attr.height);
					bars[i].attr(attr);
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
