require('dotenv').config();
var SteamCommunity = require('steamcommunity');
var community = new SteamCommunity();
var storage = require('node-persist');
var parser = require('./parser');
var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
storage.initSync();

parser.parse('https://forum.armasim.de/forum/calendar/index.php/CalendarFeed/', function (err, events){
	if (err) {
		console.log(err)	
	}
	parser.parse('https://forum.armasim.de/forum/blog/index.php/BlogFeed/', function (err, blogposts){
		if (err) {
			console.log(err)	
		}
		community.login ({
			"accountName": process.env.STEAM_ACCOUNTNAME,
    		"password": process.env.STEAM_PASSWORD
		}, function (err){ 
			if (err) {
				console.log (err)
			}

			var week = 604800000; // week in miliseconds
			events.map (function(event) {
				date = parser.returndate(event.title)
				if ((new Date) - date > -week && !(event.categories.indexOf('TF47 Team Interne Termine') > -1) ) {
					community.scheduleGroupEvent(
						process.env.STEAM_GROUPID,
						event.title,
						"107410",
						event.description,
						date,
						{ip:'46.4.112.40:2322', password:''},
						function(err) {
							if (err) {
								console.log(err)
							} else {
								console.log('posted an event')
								storage.setItemSync(event.guid, true);
							}
						}
					)
				}
			})
			blogposts.map (function(blogpost){
				if (((new Date) - Date.parse(blogpost.pubDate)) < week) {
					console.log(blogpost)
					community.postGroupAnnouncement(
						process.env.STEAM_GROUPID,
						blogpost.title,
						blogpost.description,
						function(err) {
							if (err) {
								console.log(err)
							} else {
								console.log('posted an announcement')
								storage.setItemSync(blogpost.guid, true);
							}
						}
					)
				}
			})
			process.exit()
		})


	})
})
