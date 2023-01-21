// require('newrelic');
const path = require('path');
const express = require('express');
const app = express();

const expressStaticGzip = require('express-static-gzip');
const publicPath = path.join(__dirname, '..', 'build');

const port = process.env.PORT || 3000;

app.use(function (req, res, next) {
	res.removeHeader('X-Powered-By');
	next();
});

app.use(require('prerender-node').set('prerenderToken', 'Awz6QA4WTjPNMhfDFSdL'));
app.use(
	'/',
	expressStaticGzip(publicPath, {
		enableBrotli: true,
		orderPreference: ['br', 'gz'],
		serveStatic: {
			maxAge: 8640000000, // will be kept
			cacheControl: false, // will be kept as well
		},
	})
);

app.use(function (req, res, next) {
	res.removeHeader('X-Powered-By');
	next();
});

app.use(require('prerender-node').set('prerenderToken', 'Awz6QA4WTjPNMhfDFSdL'));
app.use(
	'/',
	expressStaticGzip(publicPath, {
		enableBrotli: true,
		orderPreference: ['br', 'gz'],
		serveStatic: {
			maxAge: 8640000000, // will be kept
			cacheControl: false, // will be kept as well
		},
	})
);

// Fallback if anyfiles compression fails
app.get('/*', (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'), (err) => {
		if (err) {
			res.status(500).send(err);
		}
	});
});

app.get('*.js', function (req, res, next) {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/javascript');
	next();
});

app.get('*.css', function (req, res, next) {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/css');
	next();
});

app.listen(port, () => {});
