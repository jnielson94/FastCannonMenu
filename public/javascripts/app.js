'use strict';

var app = angular.module('menu', []);


app.controller('menuController', ['$scope', '$http', menuController]);

function menuController($scope, $http) {
  $scope.menuExists = true;
  $scope.menuData = [];
  $scope.hideShow = function(menu) {
    menu.expanded = !menu.expanded;
  }
  $scope.clearMeals = function() {
    $scope.menuData = [];
  }
  $scope.checkMeals = function() {
    var url = "/menus?d=" + $scope.date;
    $http.get(url).then(response => {
      console.log("Got a response!");
      console.log(response);
    }).catch(error => {
      console.log(error);
      $scope.menuExists = false;
    })
  };
  function pad(number, length) {
      var str = '' + number;
          while (str.length < length) {
                    str = '0' + str; 
          }
          return str;
  }

  var now = function() {
    var today = new Date(Date.now());
  var year = today.getFullYear();
  var month = pad(today.getMonth() + 1, 2);
  var date = pad(today.getDate(), 2);
 return '' + year + month + date; 
  };
  $scope.date = now();
  $scope.checkMeals();

  $scope.getMeal = function () {
    var menu = {
      "date": $scope.date,
      "expanded": true,
      "meal": $scope.meal,
      "menuItems": []
    };
    var url = "/menu?d=" + $scope.date + "&m=" + $scope.meal;
      $http.get(url).then(response => {
        console.log(response.data);
        var theRecipes = response.data.menus[0].recipes;
        var filteredMenu = theRecipes.filter(function(recipe) {
            var cat = recipe.category;
            return cat === "Euro" || cat === "Expo" || 
              cat === "Grill" || cat === "Fusion"; 
          });
        
        menu.menuItems = angular.copy(filteredMenu);
        $scope.menuData.forEach(function(menu) {
          menu.expanded = false;
        });
        $scope.menuData.push(menu);
        });
  };


}

