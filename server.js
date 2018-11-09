'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');
var rp = require('request-promise');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var addresses = [];
app.post("/api/shorturl/new", (req, res) => {
  const address = req.body.url;
  rp(address).then(success => {
    if(addresses.includes(address)) 
      return res.json({"original_url": address, "short_url": addresses.indexOf(address) + 1});
    addresses.push(address);
    return res.json({"original_url": address, "short_url": addresses.length});
  })
    .catch(err => res.json({"error":"invalid URL"}));
    
  });

 app.get("/api/shorturl/:index", (req,res) => res.redirect(addresses[req.params.index - 1]));


app.listen(port, function () {
  console.log('Node.js listening ...');
});