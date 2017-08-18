'use strict';

var app = angular.module('menu', []);


app.controller('menuController', ['$scope', '$http', menuController]);

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str; 
    }
    return str;
}

function today() {
  return new Date(Date.now());
}

function now() {
  var year = today().getFullYear();
  var month = pad(today().getMonth() + 1, 2);
  var date = pad(today().getDate(), 2);
  return '' + year + month + date; 
};
function menuController($scope, $http) {
  $scope.menuExists = true;
  $scope.meal = "DINNER";
  $scope.menuData = [];
  $scope.hideShow = function(menu) {
    menu.expanded = !menu.expanded;
  }
  $scope.clearMeals = function() {
    $scope.menuData = [];
  }
  $scope.loaderShown = false;
  var showLoader = function() {
    $scope.loaderShown = true;
  }
  var hideLoader = function() {
    $scope.loaderShown = false;
  }

  function formatDate(year, month, day) {
    return '' + year + pad(month,2) + pad(day,2);
  }

  function validateInputtedDate() {
    var year = today().getFullYear();
    var month = $scope.Month || today().getMonth() + 1;
    var day = $scope.Day || today().getDate();
    var isNext = $scope.nextYear;
    if(isNext) {
      year += 1;
    }
    return formatDate(year, month, day);
  };

  $scope.checkMeals = function() {
    showLoader();
    $scope.date = validateInputtedDate();
    var url = "/menus?d=" + $scope.date;
    $http.get(url).then(response => {
      hideLoader();
      console.log("Got a response!");
      console.log(response);
      $scope.menuExists = true;
    }).catch(error => {
      hideLoader();
      console.log(error);
      $scope.menuExists = false;
    })
  };

  $scope.date = now();
  $scope.checkMeals();

  $scope.getMeal = function () {
    $scope.date = validateInputtedDate();
    var url = "/menu?d=" + $scope.date + "&m=" + $scope.meal;
    showLoader();
    var promise = $scope.pullMeal(url);
    promise.then(response => {
      var menu = handleResponse(response);
      if(menu === "Error") return;
      hideLoader();
      $scope.menuData.forEach(function(menu) {
        menu.expanded = false;
      });
      $scope.menuData.push(menu);
    })
  }
  function parseMealDateToReadable(date) {
    console.log(date);
    if(date.length != 8) {
      console.log("Weird date: ", date);
    }
    var year = Number(date.substring(0,4));
    var month = Number(date.substring(4,6)) - 1;
    var day = Number(date.substring(6,8));
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let theDate = new Date(Date.UTC(year, month, day))
    return theDate.toLocaleDateString("en-US", options);
  }

  function handleResponse(response) {
      console.log(response.data);
      if(response.data.menus.length <= 0) return "Error"
      var menu = {
        "date": parseMealDateToReadable(response.data.menus[0].servedate),
        "expanded": true,
        "meal": response.data.menus[0].mealname,
        "menuItems": []
      };
      var theRecipes = response.data.menus[0].recipes;
      var filteredMenu = theRecipes.filter(function(recipe) {
          var soupToppings = [">>> SOUP TOPPINGS","Sliced Green Onion","Shredded Cheddar Cheese","Tortilla Strips","Sliced Almonds", "Diced Bacon", "Sour Cream"];
          var cat = recipe.category;
          return cat === "Euro" || cat === "Expo" || 
            cat === "Grill" || (cat === "Fusion" && !soupToppings.includes(recipe.description)); 
        });
      
      menu.menuItems = angular.copy(filteredMenu);
      return menu;
  }

  $scope.pullMeal = function(url) {
    console.log(url);
    return $http.get(url);
  };

  $scope.getNextWeek = function() {
    showLoader();
    var sunday = today();
    while(sunday.getDay() != 0) {
      sunday.setDate(sunday.getDate() + 1);
    if(sunday.getDay() != 0) {
      console.log(sunday);
    }
    }
    if(sunday.getDay() != 0) {
      console.log("What?");
    }
    var mealPromises = [];
    var currentDate = sunday;
    console.log(currentDate.toLocaleString());
    $http.get("/menus?d=" + formatDate(
          sunday.getFullYear(),
          sunday.getMonth() + 1,
          sunday.getDate() + 1
      )
    ).then(function() {
      for(var i = 1; i <= 7; i++) {
        (function (safeDate) {
          safeDate.setDate(safeDate.getDate() + i);
          var year = safeDate.getFullYear();
          var month = safeDate.getMonth() + 1;
          var day = safeDate.getDate();
          var urlL = "/menu?d=" + formatDate(year, month, day) + "&m=BREAKFAST";
          mealPromises.push($scope.pullMeal(urlL));
          var urlL = "/menu?d=" + formatDate(year, month, day) + "&m=LUNCH";
          mealPromises.push($scope.pullMeal(urlL));
          var urlD = "/menu?d=" + formatDate(year, month, day) + "&m=DINNER";
          mealPromises.push($scope.pullMeal(urlD));
        })(new Date(currentDate));
      }
      console.log(mealPromises);
      Promise.all(mealPromises).then(values => {
        console.log(values);
        var menus = values.map(handleResponse);
        menus.forEach(function (menu) {
          if(menu === "Error") return;
          $scope.menuData.push(menu);
        });
        $scope.menuData.forEach(function(menu) {
          menu.expanded = false;
        });
        hideLoader();
        $scope.$apply();
      });
    });
  };

}

