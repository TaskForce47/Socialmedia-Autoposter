require('dotenv').config();
var SteamCommunity = require('steamcommunity');
var community = new SteamCommunity();
var Globalize = require( "globalize" );
Globalize.load( require( "cldr-data" ).entireSupplemental() );
Globalize.load( require( "cldr-data" ).entireMainFor( "de", "en" ) );

console.log ( process.env.STEAM_ACCOUNTNAME)
community.login ({"accountName": process.env.STEAM_ACCOUNTNAME,
    "password": process.env.STEAM_PASSWORD}, function (err){ if (err) {console.log (err)}})

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('https://forum.armasim.de/forum/calendar/index.php/CalendarFeed/')
var feedparser = new FeedParser();

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

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
  	date=item.title.match(/\((.*)\)/)[1].split('-')[0]
  	date=Globalize.parseDate( date, "D", "de" );
    console.log(date);
  }
});