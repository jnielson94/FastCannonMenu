var express = require('express');
var router = express.Router();
var request = require('request');

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
    console.log(url);
    request(url).pipe(res);
});

var mealid = 6772;
router.get('/menus', function(req,res,next) {
  var date = req.query.d;
  var url = cannonMenu + "?servedate=" + date + "&viewname=MenusJSON";
  console.log(url);
  request(url, function(error, response, body) {
    if(error) console.log(error);
    console.log(body);
    console.log(JSON.parse(body));
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
