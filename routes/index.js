var express = require('express');
var router = express.Router();
var request = require('request');
/* Set up mongoose in order to connect to mongo database */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cannonMeals');
var mealSchema = mongoose.Schema({
	date: String,
  meal: String,
	result: String
})
var Meal = mongoose.model('Meal', mealSchema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Connected');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Example: http://dining.byu.edu/commons/menu_pass.php?servedate=20170523&mealname=DINNER&mealid=6772&viewname=MenuItemsJSON
var cannonMenu = "http://dining.byu.edu/commons/menu_pass.php";
router.get('/menu', function(req,res,next) {
  var date = req.query.d;
  var meal = req.query.m;
  var url = cannonMenu + "?servedate=" + date + "&mealname=" + meal +
    "&mealid=" + mealid + "&viewname=MenuItemsJSON";
    console.log(new Date().toLocaleString() + '  ' + url);
  request(url, function(error, response, body) {
    if(error) console.log("ERROR: " + error);
    if(!body) {
      console.log("No body?");
      res.status(500).send("No response?");
      return;
    }
    console.log(new Date().toLocaleString() + '  ' + body);
    body = JSON.parse(body);
    res.status(200).json(body);
  });
});

var mealid = 6772;
router.get('/menus', function(req,res,next) {
  var date = req.query.d;
  var url = cannonMenu + "?servedate=" + date + "&viewname=MenusJSON";
  request(url, function(error, response, body) {
    if(error) console.log("ERROR: " + error);
    if(!body) {
      console.log("No body?");
      res.status(500).send("No response?");
      return;
    }
    console.log(new Date().toLocaleString() + '  ' + url);
    console.log(new Date().toLocaleString() + '  ' + body);
    body = JSON.parse(body);
    if(body.menus[0]) {
      mealid = body.menus[0].mealid;
      res.status(200).json(body);
    }
    else {
      res.status(404).send("No menus for that day yet");
    }
  });
//  request(url).pipe(res);
});

module.exports = router;
