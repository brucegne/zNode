const express = require("express");
const app = express();
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const REDISURL="redis://redistogo:0566827014ab8c2c76bcad1ab98239a7@angler.redistogo.com:9285/"
const rs = require('redis-url').connect(REDISURL);
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://brucegne:p2shiver@ds043368.mongolab.com:43368/";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("demo");
});

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyooAs1ySDo46B4K'}).base('appOEjuG867PcJetu');

const port = 5000;

// Body parser
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs');

app.get('/', function(req,res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/data'), function(req,res) {
  base('Family').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view",
    sort: [{field: "Name", direction: "desc"}]
   }).eachPage(function page(records, fetchNextPage) {
    res.send(JSON.stringify(records));
  })
}

app.get('/mdata'), function(req,res) {
  dbo.collection("contacts").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.send(result);
    });
}
  

app.get('/Data', function(req,res) {
    var mOut = {};
    var mRow = [];
    base('Family').select({
        maxRecords: 50,
        view: "Grid view"
        }).eachPage(function page(records, fetchNextPage) {
          records.forEach(function(record) {
            var mLine = {};
            mLine.id = record.getId();
            mLine.Name = record.get('Name');
            mLine.Notes = record.get('Notes');
            mRow.push(mLine);
        });
        mOut.records=mRow;
        fetchNextPage();        
          res.send(JSON.stringify(mOut));
        })
});

app.get('/angular', function(req,res) {
  res.sendFile(__dirname + '/views/angular.html');
});

// Mock API
app.get("/users", (req, res) => {
  res.json([
    { name: "Kellie Gordon", age: "24", "married": "Nope, just Indie and Lucy" },
    { name: "Mike Gordon", age: "37", "married": "Yep, Sam, Adelynn" },
    { name: "Dan Gordon", age: "39", "married": "Yep, Lindsay, Ayla, Dana, James" },
    { name: "Casey Gordon", age: "40", "married": "Yep, Blondie, Dark Hair, Little Boy" },
    { name: "Brian Gordon", age: "43", "married": "Yep, Nikki, Kinze, Aedan" }
  ]);
});

app.get('/keys', function(req, res) {
      rs.hkeys( 'Images',  function(err, value) {res.send(JSON.parse(value))});
});

app.get('/all', function(req, res) {
      rs.hgetall( 'Contacts',  function(err, value) {res.send(JSON.stringify(value))});
});

app.post("/user", (req, res) => {
  const { name, location } = req.body;

  res.send({ status: "User created", name, location });
});

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});