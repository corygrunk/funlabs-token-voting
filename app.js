// app.js

// BASE SETUP
// ==============================================

// NPM Modules
var http = require('http'),
		express = require('express');

var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

var router = express.Router();



// MIDDLEWARE
// ==============================================

// Route middleware that will happen on every request
router.use(function(req, res, next) {
	// Log each request to the console
	console.log(req.method, req.url);

	next();	
});


// ROUTES
// ==============================================

router.get('/', function(req, res) {
  res.render('index', {title : 'Site Title'});
});

app.use('/', router);



// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port);
});
