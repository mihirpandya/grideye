var socket = io.connect('http:' + document.domain + ':' + location.port);
console.log('Connected to http:' + document.domain + ':' + location.port);

socket.on('connect', function() {
    socket.emit('startUpdate', {data: 'I\'m connected!'});
});

angular.module('ezpzeApp', ['ngRoute'])

.config(['$httpProvider', '$routeProvider', '$locationProvider',
  function ($httpProvider, $routeProvider, $locationProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $routeProvider
      .when('/', {
        title: 'Home',
        templateUrl: '/templates/ng-view/home.html',
        controller: 'HomeCtrl',
      });

}])

.controller('HomeCtrl', [ '$scope', function ($scope) {

  $scope.DEBUG = false;

  var SQUARE_LENGTH = 100;
  var CALIBRATION_COUNT = 20;
  var RESET_MODE = 'reset';
  var CALIBRATION_MODE = 'calibration';
  var OPERATION_MODE = 'operation';

  $scope.calibrating = true;
  $scope.tapped = false;
  var iterations = 0;


  var getOffsetsFromDiameter = function (d) {
    return (SQUARE_LENGTH - d) / 2;
  }

  $scope.grid = [];
  $scope.touch = {};

  var updateGrid = function (mode, grid) {
    var heatIndex, offset, size, on;
    var foundTip = false;
    for (var i = 0; i < 8; i++) {
      if (mode === RESET_MODE) {
        $scope.grid.push([]);
      }
      for (var j = 0; j < 8; j++) {
        if (mode === RESET_MODE) {
          heatIndex = 20;
        } else {
          heatIndex = grid[i][j]; // 0~255
        }

        if (mode === RESET_MODE) {
          offset = getOffsetsFromDiameter(heatIndex);
          $scope.grid[i].push({
            id: i*8+j,
            threshold: {
              total: 0,
              min: 255,
              av: 128,
              max: 0,
              range: 0
            },
            style: {
              width: heatIndex + 'px',
              height: heatIndex + 'px',
              top: offset + 'px',
              left: offset + 'px'
            },
            heatIndex: undefined
          });
        }
        else if (mode === CALIBRATION_MODE) {
          $scope.grid[i][j].heatIndex = heatIndex;
          $scope.grid[i][j].threshold = {
            total: $scope.grid[i][j].threshold.total + heatIndex,
            min: Math.min($scope.grid[i][j].threshold.min, heatIndex),
            av: ($scope.grid[i][j].threshold.total + heatIndex) / iterations,
            max: Math.max($scope.grid[i][j].threshold.max, heatIndex),
            range: $scope.grid[i][j].threshold.max - $scope.grid[i][j].threshold.min
          };
        }
        else if (mode === OPERATION_MODE) {
          $scope.grid[i][j].heatIndex = heatIndex;
          on = heatIndex > ($scope.grid[i][j].threshold.max + 4) && $scope.tapped;
          size = on ? 80 : 20;
          offset = getOffsetsFromDiameter(size);
          $scope.grid[i][j].style = {
            width: size + 'px',
            height: size + 'px',
            top: offset + 'px',
            left: offset + 'px'
          }
          if (!foundTip && on) {
            $scope.grid[i][j].style.backgroundColor = 'red';
            foundTip = true;
          }
        }

      }
    }
  }

  var updateTouch = function (mode, volts) {
    if (mode === RESET_MODE) {
      $scope.touch = {
        total: 0,
        min: 255,
        av: 128,
        max: 0,
        range: 0,
        on: false
      };
    }
    else if (mode === CALIBRATION_MODE) {
      $scope.touch = {
        volts: volts,
        total: $scope.touch.total + volts,
        min: Math.min($scope.touch.min, volts),
        av: ($scope.touch.total + volts) / iterations,
        max: Math.max($scope.touch.max, volts),
        range: $scope.touch.max - $scope.touch.min
      };
    }
    else if (mode === OPERATION_MODE) {
      $scope.touch.volts = volts;
      $scope.touch.on = volts > 0.05 ? true : false;
      if ($scope.touch.on) {
        $scope.tapped = !$scope.tapped;
      }
    }
  }

  updateGrid(RESET_MODE);
  updateTouch(RESET_MODE);

  socket.on('updateArray', function(data) {
    $scope.$apply(function () {
      iterations++;
      var volts = data.volts;
      var grid = data.arr;

      if (iterations <= CALIBRATION_COUNT) {
        updateGrid(CALIBRATION_MODE, grid);
        updateTouch(CALIBRATION_MODE, volts);
        if (iterations == CALIBRATION_COUNT) {
          $scope.calibrating = false;
        }
      } else {
        updateGrid(OPERATION_MODE, grid);
        updateTouch(OPERATION_MODE, volts);
      }
  	});
  });

}]);
