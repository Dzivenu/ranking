var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var router = require('express').Router()

router.get('/', function(req, res, next) {
	rankings(req.query.account, function(ranks) {
		console.log('Done!')
		res.json(ranks)
	})	
})

var rankings = function(account_param, callback) {
	var uriSteemData = 'mongodb://steemit:steemit@mongo1.steemdata.com/SteemData'

	var ranks = []

	MongoClient.connect(uriSteemData, function(err, db) {
		assert.equal(null, err);		
		console.log('SteemData [C]')

		db.collection('Accounts').aggregate([{ '$group': { '_id': null, 'max': { '$max': '$vesting_shares.amount' }, 'min': { '$min': '$vesting_shares.amount' } }}]).toArray(function(err, vests) {

			if(!err) {
				vests.forEach(function(vest) {
					
					account_param = account_param.toLowerCase()
					
					var clean_account = account_param

					if(account_param.match('@')) {
						clean_account = account_param.replace('@', '')
					}					

					db.collection('Accounts').find({'account': clean_account}, {account: 1, 'vesting_shares.amount':1}).toArray(function(err, accounts) {
						if(!err) {
							db.close()
							console.log('SteemData [D]')

							accounts.forEach(function(account) {
								var rank = 100 * ((account.vesting_shares.amount - vest.min)/(vest.max - vest.min))
								var rank_percent = rank.toFixed(3).toString() + ' %'
								console.log(clean_account + ': ' + rank_percent + ' Ranking');

								ranks.push({ account: clean_account, rank: rank_percent })
							})

							callback(ranks)
						}
					})
				})
			}
		})
	})
}

module.exports = router

