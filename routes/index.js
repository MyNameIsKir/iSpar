var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'iSpar', scripts: ['//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', '/javascripts/bootstrap.min.js', 'https://cdn.socket.io/socket.io-1.1.0.js', '/javascripts/detectmobilebrowser.js', '/javascripts/shake.js', '/javascripts/application.js', '/javascripts/docs.min.js'] });
});

module.exports = router;
