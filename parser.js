var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var parserObj = {};
var sanitizeHtml = require('sanitize-html');
var storage = require('node-persist');
storage.initSync();

parserObj.returndate = function (title) {
	date=title.match(/\((.*)\)/)[1].split('-')[0].split(', ')
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
	hour=date[2].split(':')[0]-1
	minutes=date[2].split(':')[1]

	return new Date(Date.parse(day + ' ' + month + ' ' + year + ' ' + hour + ':' + minutes))
}

parserObj.parse = function (feed, cb) {
	if (feed) {
		var items=[]
		var req = request(feed)
		var feedparser = new FeedParser({addmeta: false});

		req.on('error', function (error) {
			if (cb){
				cb(error)
			}
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
			if (cb){
				cb(error)		
			} 
		});

		feedparser.on('readable', function () {
		  // This is where the action is!
		  var stream = this; // `this` is `feedparser`, which is a stream
		  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
		  var item;
		  while (item = stream.read()) {

		  	items.push(item)
		  }
		});

		feedparser.on('end', function (){
			var result = []
			items.map(function (e){
				if ( !(storage.getItemSync(e.guid))){
					var newItem = {}
					newItem.title = sanitizeHtml(e.title, { allowedTags: [], allowedAttributes: [] })
					newItem.description =  sanitizeHtml(e.description, { allowedTags: [], allowedAttributes: [] })
					newItem.pubDate = sanitizeHtml(e.pubDate, { allowedTags: [], allowedAttributes: [] })
					newItem.guid = sanitizeHtml(e.guid, { allowedTags: [], allowedAttributes: [] })
					newItem.categories = e.categories
					result.push(newItem)
				}
			})
			cb(null, result)
			return result
		})
	} else {
		cb ("no feed Provided")
	}
}

module.exports = parserObj;