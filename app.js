// app.js

// BASE SETUP
// ==============================================

// NPM Modules
const http = require('http')
const express = require('express')
const dotenv = require('dotenv').config()
const request = require('request')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 5000

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser())

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

var launchVoting = function () {
	var voterSilverCount = 0
	var voterGoldCount = 0
	var voterPlatinumCount = 0
	
	base('Imported table').select({
		// Selecting the first 500 records in Grid view:
		maxRecords: 500,
		view: "Grid view"
	}).eachPage(function page(records, fetchNextPage) {
		// This function (`page`) will get called for each page of records.
	
		records.forEach(function(record) {
			if (record.get('Silver') > 0) {
				voterSilverCount++
				missionsReq(record.get('Email'), 'Silver')
			}
			if (record.get('Gold') > 0) {
				voterGoldCount++
				missionsReq(record.get('Email'), 'Gold')
			}
			if (record.get('Platinum') > 0) {
				voterPlatinumCount++
				missionsReq(record.get('Email'), 'Platinum')
			}
		})
	
		// To fetch the next page of records, call `fetchNextPage`.
		// If there are more records, `page` will get called again.
		// If there are no more records, `done` will get called.
		fetchNextPage()
	
	}, function done(err) {
		if (err) { console.error(err); return; }
		console.log(voterSilverCount + voterGoldCount + voterPlatinumCount + ' missions launched.')
	})
}

// MISSION WEBHOOK REQUEST
var missionsReq = function (email, tokenType) {
	var missionsHook = process.env.MISSIONS_WEBHOOK_URL

	var missionsHookBody = '{ "person": "' + email + '", "token": "' + tokenType + '"}'
	missionsHookBody = (JSON.parse(missionsHookBody))

	request.post({
		url: missionsHook,
		form: missionsHookBody
	}, function(err, response, body){
		if (err) { console.error(err.body); return; }
		// TODO: Log errors.
	})
}

// GET NUMBER OF TOKENS
var getNumberOfTokens = function () {
	var tokenSilverCount = 0
	var tokenGoldCount = 0
	var tokenPlatinumCount = 0
	base('Imported table').select({
		// Selecting the first 500 records in Grid view:
		maxRecords: 500,
		view: "Grid view"
	}).eachPage(function page(records, fetchNextPage) {
		// This function (`page`) will get called for each page of records.
	
		records.forEach(function(record) {
			if (record.get('Silver') > 0) {
				tokenSilverCount++
			}
			if (record.get('Gold') > 0) {
				tokenGoldCount++
			}
			if (record.get('Platinum') > 0) {
				tokenPlatinumCount++
			}
		})
	
		// To fetch the next page of records, call `fetchNextPage`.
		// If there are more records, `page` will get called again.
		// If there are no more records, `done` will get called.
		fetchNextPage()
	
	}, function done(err) {
		if (err) { console.error(err); return; }
		console.log(tokenSilverCount + ' silver tokens available.')
		console.log(tokenGoldCount + ' gold tokens available.')
		console.log(tokenPlatinumCount + ' platinum tokens available.')
	})
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
  res.render('index', {title : 'Fun Labs Token Voting Admin'})
})

app.use('/', router)

// Launch voting when button is clicked:
router.post('/launch', function(req,res){
	// console.log(req.body)
	launchVoting()
	res.render('index', {title : 'Voting Launched - Fun Labs Token Voting Admin'})
})

// Launch counting when button is clicked:
router.post('/count', function(req,res){
	// console.log(req.body)
	getNumberOfTokens()
	res.render('index', {title : 'Token Count - Fun Labs Token Voting Admin'})
})



// START THE SERVER
// ==============================================

app.listen(port, function() {
  console.log("Listening on " + port)
})