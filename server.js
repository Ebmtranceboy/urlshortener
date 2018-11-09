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
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true});

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


const countSingleton = new mongoose.Schema({value: Number});
var Count = mongoose.model('Count', countSingleton);

Count.findOne({value:  { $gte: 0}}, (err, data) => {
            if (err || !data) {
              const zero = new Count({value: 0});
              zero.save();
            }});

const urlSchema = new mongoose.Schema({
  url: String, short: Number
});
var Url = mongoose.model('Url',urlSchema);

//Count.remove({}).exec();
//Url.remove({}).exec();


app.post("/api/shorturl/new", (req, res) => {
  const address = req.body.url;
  rp(address).then(success => {
    Url.findOne({url: new RegExp(address, 'i')}, (err, data) => {
      if(err || !data){
        Count.findOne({value:  { $gte: 0}}, (err, cpt) => {
          const count = cpt.value + 1;
          const entry = new Url({url: address, short: count});
          
          Count.findByIdAndUpdate(cpt._id, {value: count}, {new: true}, (err,dat)=>{});
          entry.save();
          
          return res.json({"original_url": address, "short_url": count});
        });
      } else{
        return res.json({"original_url": data.url, "short_url": data.short});
      }
  })})
    .catch(err => res.json({"error":"invalid URL"}));
    
  });

 app.get("/api/shorturl/:index", (req,res) => {
   Url.findOne({short: {$eq: req.params.index}}, (err, data) => {
     res.redirect(data.url);
   });
   
 });


app.listen(port, function () {
  console.log('Node.js listening ...');
});