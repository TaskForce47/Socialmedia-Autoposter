require('dotenv').config();
var SteamCommunity = require('steamcommunity');
var community = new SteamCommunity();
var storage = require('node-persist');

storage.initSync();




var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('https://forum.armasim.de/forum/calendar/index.php/CalendarFeed/')
var feedparser = new FeedParser({addmeta: false});

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});
community.login (
	{
		"accountName": process.env.STEAM_ACCOUNTNAME,
    	"password": process.env.STEAM_PASSWORD
	}, function (err){ 
		if (err) {
			console.log (err)
		}
		community.loggedIn(function (err,loggedIn) {
			if (err) {
				console.log(err)
			}
			console.log(loggedIn)
		})

		feedparser.on('readable', function () {
		  // This is where the action is!
		  var stream = this; // `this` is `feedparser`, which is a stream
		  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
		  var item;

		  while (item = stream.read()) {
		  	date=item.title.match(/\((.*)\)/)[1].split('-')[0].split(', ')
		    day= date[1].split(' ')[0]
		    month= date[1].split(' ')[1]
		    year= date[1].split(' ')[2]
			switch (month) {
			  case "Januar":
		    	month= "January";
		    	break;
			  case "Februar":
			    month= "February";
			    break;
			  case "März":
				month= "March";
				break;
			  case "Mai":
			    month= "May";
			    break;
			  case "Juni":
			    month= "June";
			    break;
			  case "Juli":
			    month= "July";
			    break;
			  case "Oktober":
			    month= "October";
			    break;
			  case "Dezember":
			    month= "December";
			    break;
			}
			timestamp=new Date(Date.parse(day + ' ' + month + ' ' + year + ' ' + date[2]))
			if (!(storage.getItemSync(item.guid))){
				community.scheduleGroupEvent(
					process.env.STEAM_GROUPID,
					item.title,
					"107410",
					item.description,
					timestamp,
					{ip:'46.4.112.40:2322', password:''},
					function(err) {
						if (err) {
							console.log(err)
						} else {
							storage.setItemSync(item.guid,true);
						}
					}
				)
				
				console.log("posted an event")
			} else {
				console.log("already posted this event")
			}

		  }
		  process.exit()
		});
	}
)