var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var express = require('express')
var bodyParser = require('body-parser')

var app = express()
app.use(bodyParser.json())

app.get('/api/ranks', function(req, res, next) {
	ranking(function(ranks) {
		console.log('Done!')
		res.json(ranks)
	})	
})

var ranking = function(callback) {
	var uriSteemData = 'mongodb://steemit:steemit@mongo1.steemdata.com/SteemData'

	var account = 'gutzofter'
	var ranks = []

	MongoClient.connect(uriSteemData, function(err, db) {
		assert.equal(null, err);		
		console.log("SteemData [C]");


		db.collection('Accounts').aggregate([{ '$group': { '_id': null, 'max': { '$max': '$vesting_shares.amount' }, 'min': { '$min': '$vesting_shares.amount' } }}]).toArray(function(err, vests) {

			if(!err) {
				vests.forEach(function(vest) {

					db.collection('Accounts').find({'account': account}, {account: 1, 'vesting_shares.amount':1}).toArray(function(err, accounts) {
						if(!err) {
							db.close()
							console.log("SteemData [D]")

							accounts.forEach(function(account) {
								var rank = 100 * ((account.vesting_shares.amount - vest.min)/(vest.max - vest.min))
								var rank_percent = rank.toFixed(3).toString() + ' %'
								console.log(rank_percent);

								ranks.push(rank_percent)
							})

							callback(ranks)
						}
					})
				})
			}
		})
	})
}

app.listen(3000, function() {
	console.log('Server: ', 3000)
})

