# node-highcharts

An example library demonstrating how a browser based JavaScript graphing library (Highcharts) can be used from Node.

## Usage
```` js
var fs = require('fs'),
	highcharts = require('node-highcharts'),
	options = {
		chart: {
			width: 300,
			height: 300,
			defaultSeriesType: 'bar'
		},
		legend: {
			enabled: false
		},
		title: {
			text: 'Highcharts rendered by Node!'
		},
		series: [{
			data: [ 1, 2, 3, 4, 5, 6 ]
		}]
	};

highcharts.render(options, function(err, data) {
	if (err) {
		console.log('Error: ' + err);
	} else {
		fs.writeFile('chart.png', data, function() {
			console.log('Written to chart.png');
		});
	}
});
````

<img src="http://i.imgur.com/eOvgU.png" alt="Bar Chart" />

## Todo
There's a few bits to do before the library will be ready for use.

1. Cleanup jsdom window instance correctly.
1. Cache window so we don't load jQuery+highcharts for every render.
1. Use a local jQuery.
1. Update to latest Highcharts version.
1. Investigate using [CanVG](http://code.google.com/p/canvg/) and [node-canvas](https://github.com/LearnBoost/node-canvas) to render with no dependencies on the environment.