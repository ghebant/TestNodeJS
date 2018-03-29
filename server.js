var express = require('express');

var app = express();
var url = 'https://www.numerama.com/feed/';
var fp = require('feedparser');
var request = require('request');

var MongoClient = require("mongodb").MongoClient;

var feedparser = new fp();

app.get('/', function(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    var html = '<!DOCTYPE html>'+
'<html>'+
'    <head>'+
'        <meta charset="utf-8" />'+
'        <title>Ma page Node.js !</title>'+
'    </head>'+ 
'    <body>'+
'     	<p>Page de <strong>TEST</strong> !</p>'+
'    </body>'+
'</html>'
  res.write(html);
});

var req = request(url);

req.on('error', function (error) {
    console.log('error feedparser');
});

req.on('response', function (res) {
  var stream = this;

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
    console.log('error feedparser' + error);
});

feedparser.on('readable', function () {
    var stream = this;
    var meta = this.meta;
    var item;

    MongoClient.connect("mongodb://localhost/test", function(error, db) {
	if (error) return funcCallback(error);
	console.log("Connected to test db'");
	
	while (item = stream.read()) {
	    console.log(item);
	    db.collection("fluxRSS").insert(item, null, function (error, results) {
		if (error)
		{
		    console.log("fail to insert in db" + error);
		    throw error;
		}
		
	    });
	    console.log("Insert in db OK");
	}
    });
});
	      
app.listen(8080);
