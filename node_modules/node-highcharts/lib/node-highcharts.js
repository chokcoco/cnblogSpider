var jsdom = require('jsdom'),
	spawn	= require('child_process').spawn;

function createHighchartsWindow(callback) {
	var window 	= jsdom.jsdom().createWindow(),
		script	= window.document.createElement('script');
	
	// Convince Highcharts that our window supports SVG's
	window.SVGAngle = true;
	
	// jsdom doesn't yet support createElementNS, so just fake it up
	window.document.createElementNS = function(ns, tagName) {
		var elem = window.document.createElement(tagName);	
		elem.getBBox = function() {
			return {
				x: elem.offsetLeft,
				y: elem.offsetTop,
				width: elem.offsetWidth,
				height: elem.offsetHeight
			};
		};
		return elem;
	};
	
	// Load scripts
	jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js', function(w,jq) {
		var filename = 'file:///' + __dirname + '/highcharts/highcharts.src.js';
		script.src = filename;
		script.onload = function() {
			callback(window);
		}
		window.document.body.appendChild(script);
	});
}

function serverifyOptions(options) {
		options.chart.renderTo = 'container';
		options.chart.renderer = 'SVG';
		options.chart.animation = false;
		options.series.forEach(function(series) {
			series.animation = false;
		});
}

function render(options, callback) {
	createHighchartsWindow(function(window) {
		try {
			var $	= window.jQuery,
				Highcharts 	= window.Highcharts,
				document	= window.document,
				$container	= $('<div id="container" />'),
				chart, svg, convert, buffer;

			$container.appendTo(document.body);

			serverifyOptions(options);
			
			try {
				chart = new Highcharts.Chart(options);
			} catch (e) {
				callback(e, null);
				return;
			}

			svg = $container.children().html();
			// Start convert
			convert	= spawn('convert', ['svg:-', 'png:-']);

			// Pump in the svg content
			convert.stdin.write(svg);
			convert.stdin.end();
			
			// Write the output of convert straight to the response
			convert.stdout.on('data', function(data) {
				try {
					var prevBufferLength = (buffer ? buffer.length : 0),
						newBuffer = new Buffer(prevBufferLength + data.length);
						
					if (buffer) {
						buffer.copy(newBuffer, 0, 0);
					}
					
					data.copy(newBuffer, prevBufferLength, 0);
					
					buffer = newBuffer;
				} catch (err) {
					callback(err, null);
				}
			});
			
			// When we're done, we're done
			convert.on('exit', function(code) {
				callback(null, buffer);
			});
		} catch (err) {
			callback(err, null);
		}
	});
}

exports.render = render;
