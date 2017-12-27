// app.js

// BASE SETUP
// ==============================================

// NPM Modules
const http = require('http')
const express = require('express')
const dotenv = require('dotenv').config()
const request = require('request')

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

// QUERY AIRTABLE

base('Imported table').select({
	// Selecting the first 500 records in Grid view:
	maxRecords: 500,
	view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
	// This function (`page`) will get called for each page of records.

	records.forEach(function(record) {
		if (record.get('Silver') > 0) {
			missionsReq(record.get('Email'))
		}
	});

	// To fetch the next page of records, call `fetchNextPage`.
	// If there are more records, `page` will get called again.
	// If there are no more records, `done` will get called.
	fetchNextPage()

}, function done(err) {
	if (err) { console.error(err); return; }
})

// MISSION WEBHOOK REQUEST
var missionsReq = function (email) {
	var missionsHook = 'https://api.missions.ai/webhook_trigger/e4f351c0-eb25-11e7-b75f-0a580a1c0534?auth_token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MTQzOTMzNjksInN1YiI6ImU0ZjM1MWMwLWViMjUtMTFlNy1iNzVmLTBhNTgwYTFjMDUzNCJ9.sktZUDjN-25S89-PYPslg-l44CEmkya6TleIxP1SYUi2cIZK9PfTkLVHLg7laPiv3sejuZ6KdYZQO8IlirzK4A'

	var missionsHookBody = '{ "person": "' + email + '"}'
	missionsHookBody = (JSON.parse(missionsHookBody))

	request.post({
		url: missionsHook,
		form: missionsHookBody
	}, function(error, response, body){
		console.log('statusCode:', response && response.statusCode)
	});
}


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
