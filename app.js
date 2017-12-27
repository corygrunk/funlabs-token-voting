// app.js

// BASE SETUP
// ==============================================

// NPM Modules
const http = require('http')
const express = require('express')
const dotenv = require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))

const router = express.Router()

// AIRTABLE CONFIG
// ==============================================
const Airtable = require('airtable')
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_API_KEY
})

var base = Airtable.base(process.env.AIRTABLE_BASE)

base('Imported table').select({
	// Selecting the first 3 records in Grid view:
	maxRecords: 500,
	view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
	// This function (`page`) will get called for each page of records.

	records.forEach(function(record) {
			console.log('Retrieved', record.get('Email'))
	});

	// To fetch the next page of records, call `fetchNextPage`.
	// If there are more records, `page` will get called again.
	// If there are no more records, `done` will get called.
	fetchNextPage()

}, function done(err) {
	if (err) { console.error(err); return; }
})


// MIDDLEWARE
// ==============================================

// Route middleware that will happen on every request
router.use(function(req, res, next) {
	// Log each request to the console
	console.log(req.method, req.url)

	next()
})


// ROUTES
// ==============================================

router.get('/', function(req, res) {
  res.render('index', {title : 'Site Title'})
});

app.use('/', router)



// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port)
})
