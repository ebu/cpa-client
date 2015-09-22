'use strict';

var express     = require('express'),
    morgan      = require('morgan'),
    app         = express(),
    serveStatic = express.static,
    port        = process.env.PORT || 8000,
    config      = require('./config');

app.use(morgan('combined'));
app.use(serveStatic('.'));

app.get('/', function(req, res) {
  return res.redirect('/cpa-device.html');
});

app.get('/config', function(req, res) {
  return res.json(config);
});

console.log('Listening on port ' + port);
app.listen(port);
