var socket = io.connect('http:' + document.domain + ':' + location.port);
console.log('Connected to http:' + document.domain + ':' + location.port);

socket.on('connect', function () {
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
      })
      .when('/calculator', {
        title: 'Calculator',
        templateUrl: '/templates/ng-view/calculator.html',
        controller: 'CalculatorCtrl',
      });

}])

.factory('GridService', [ function () {

  var that = {};
  var res = {};

  that.DEBUG = false;

  var SQUARE_LENGTH = 100;
  var ON_SIZE = 80;
  var OFF_SIZE = 20;
  var ON_BG_COLOR = "#AAAAAA";
  var OFF_BG_COLOR = "#AAAAAA";

  var CALIBRATION_COUNT = 20;
  var RESET_MODE = 'reset';
  var CALIBRATION_MODE = 'calibration';
  var OPERATION_MODE = 'operation';

  that.calibrating = true;
  that.tapped = false;
  that.didTap = false;
  that.tipIndex = undefined;
  that.coffee = false;
  var iterations = 0;


  var getOffsetsFromDiameter = function (d) {
    return (SQUARE_LENGTH - d) / 2;
  }

  that.grid = [];
  that.touch = {};

  res.setGridParams = function (length, onSize, offSize, onBgColor, offBgColor) {
    SQUARE_LENGTH = length;
    ON_SIZE = onSize;
    OFF_SIZE = offSize;
    ON_BG_COLOR = onBgColor;
    OFF_BG_COLOR = offBgColor;
  }

  res.getCoffee = function () {
    return that.coffee;
  }

  res.getGrid = function () {
    return that.grid;
  }

  res.getTouch = function () {
    return that.touch;
  }

  res.getCalibrating = function () {
    return that.calibrating;
  }

  res.getTapped = function () {
    return that.tapped;
  }

  res.didTap = function () {
    return that.didTap;
  }

  res.getTipIndex = function () {
    return that.tipIndex;
  }

  res.reset = function () {
    updateGrid(RESET_MODE);
    updateTouch(RESET_MODE);
  }

  var updateGrid = function (mode, grid) {
    var heatIndex, offset, size, on, color;
    var foundTip = false;
    for (var i = 0; i < 8; i++) {
      if (mode === RESET_MODE) {
        that.grid.push([]);
      }
      for (var j = 0; j < 8; j++) {
        if (mode === RESET_MODE) {
          heatIndex = OFF_SIZE;
        } else {
          heatIndex = grid[i][j]; // 0~255
        }

        if (mode === RESET_MODE) {
          offset = getOffsetsFromDiameter(heatIndex);
          that.grid[i].push({
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
              left: offset + 'px',
              backgroundColor: OFF_BG_COLOR
            },
            heatIndex: undefined
          });
        }
        else if (mode === CALIBRATION_MODE) {
          that.grid[i][j].heatIndex = heatIndex;
          that.grid[i][j].threshold = {
            total: that.grid[i][j].threshold.total + heatIndex,
            min: Math.min(that.grid[i][j].threshold.min, heatIndex),
            av: (that.grid[i][j].threshold.total + heatIndex) / iterations,
            max: Math.max(that.grid[i][j].threshold.max, heatIndex),
            range: that.grid[i][j].threshold.max - that.grid[i][j].threshold.min
          };
        }
        else if (mode === OPERATION_MODE) {
          that.grid[i][j].heatIndex = heatIndex;
          on = heatIndex > (that.grid[i][j].threshold.max + 4) && that.tapped;
          if (heatIndex > 170) {
            that.coffee = true;
          }
          size = on ? ON_SIZE : OFF_SIZE;
          bgColor = on ? ON_BG_COLOR : OFF_BG_COLOR;
          offset = getOffsetsFromDiameter(size);
          that.grid[i][j].style = {
            width: size + 'px',
            height: size + 'px',
            top: offset + 'px',
            left: offset + 'px',
            backgroundColor: bgColor
          }
          if (!foundTip && on) {
            that.grid[i][j].style.backgroundColor = 'red';
            foundTip = true;
            that.tipIndex = i * 8 + j;
          }
        }

      }
    }
  }

  var updateTouch = function (mode, volts) {
    if (mode === RESET_MODE) {
      that.touch = {
        total: 0,
        min: 255,
        av: 128,
        max: 0,
        range: 0,
        on: false
      };
    }
    else if (mode === CALIBRATION_MODE) {
      that.touch = {
        volts: volts,
        total: that.touch.total + volts,
        min: Math.min(that.touch.min, volts),
        av: (that.touch.total + volts) / iterations,
        max: Math.max(that.touch.max, volts),
        range: that.touch.max - that.touch.min
      };
    }
    else if (mode === OPERATION_MODE) {
      that.touch.volts = volts;
      that.touch.on = volts > 0.05 ? true : false;
      that.didTap = that.touch.on;
      if (that.touch.on) {
        that.tapped = !that.tapped;
      }
    }
  }

  updateGrid(RESET_MODE);
  updateTouch(RESET_MODE);

  res.update = function (data) {
    iterations++;
    var volts = data.volts;
    var grid = data.arr;

    if (iterations <= CALIBRATION_COUNT) {
      updateGrid(CALIBRATION_MODE, grid);
      updateTouch(CALIBRATION_MODE, volts);
      if (iterations == CALIBRATION_COUNT) {
        that.calibrating = false;
      }
    } else {
      updateGrid(OPERATION_MODE, grid);
      updateTouch(OPERATION_MODE, volts);
    }
  }

  return res;

}])

.controller('HomeCtrl', [ '$scope', 'GridService', '$location', function ($scope, GridService, $location) {

  $scope.DEBUG = false;

  $scope.grid = GridService.getGrid();
  $scope.touch = GridService.getTouch();
  $scope.calibrating = GridService.getCalibrating();
  $scope.tapped = GridService.getTapped();

  GridService.setGridParams(100, 80, 0, 'transparent', 'transparent');

  socket.on('updateArray', function (data) {
    $scope.$apply(function () {
      GridService.update(data);
      $scope.grid = GridService.getGrid();
      $scope.touch = GridService.getTouch();
      $scope.calibrating = GridService.getCalibrating();
      $scope.tapped = GridService.getTapped();
      if (GridService.getCoffee()) {
        $location.path("http://www.ecebros.com/549");
      }
  	});
  });

}])

.controller('CalculatorCtrl', [ '$scope', 'GridService', function ($scope, GridService) {

  $scope.grid = GridService.getGrid();
  $scope.touch = GridService.getTouch();
  $scope.calibrating = GridService.getCalibrating();
  $scope.tapped = GridService.getTapped();

  GridService.setGridParams(75, 60, 0, 'transparent', 'transparent');

  GridService.reset();

  $scope.tip;

  socket.on('updateArray', function (data) {
    $scope.$apply(function () {
      GridService.update(data);
      $scope.grid = GridService.getGrid();
      $scope.touch = GridService.getTouch();
      $scope.calibrating = GridService.getCalibrating();
      $scope.tapped = GridService.getTapped();
      if (GridService.didTap()) {
        console.log('tapped');
        $scope.tip = GridService.getTipIndex();
        console.log(GridService.getTipIndex());

        if ($scope.tip == 0 || $scope.tip == 1 || $scope.tip == 8 || $scope.tip == 9) {
          $scope.numClick('7');
        } else if ($scope.tip == 2 || $scope.tip == 3 || $scope.tip == 10 || $scope.tip == 11) {
          $scope.numClick('8');
        } else if ($scope.tip == 4 || $scope.tip == 5 || $scope.tip == 12 || $scope.tip == 13) {
          $scope.numClick('9');
        } else if ($scope.tip == 6 || $scope.tip == 7 || $scope.tip == 14 || $scope.tip == 15) {
          $scope.opClick('/');
        } else if ($scope.tip == 16 || $scope.tip == 17 || $scope.tip == 24 || $scope.tip == 25) {
          $scope.numClick('4');
        } else if ($scope.tip == 18 || $scope.tip == 19 || $scope.tip == 26 || $scope.tip == 27) {
          $scope.numClick('5');
        } else if ($scope.tip == 20 || $scope.tip == 21 || $scope.tip == 28 || $scope.tip == 29) {
          $scope.numClick('6');
        } else if ($scope.tip == 22 || $scope.tip == 23 || $scope.tip == 30 || $scope.tip == 31) {
          $scope.opClick('*');
        } else if ($scope.tip == 32 || $scope.tip == 33 || $scope.tip == 40 || $scope.tip == 41) {
          $scope.numClick('1');
        } else if ($scope.tip == 34 || $scope.tip == 35 || $scope.tip == 42 || $scope.tip == 43) {
          $scope.numClick('2');
        } else if ($scope.tip == 36 || $scope.tip == 37 || $scope.tip == 44 || $scope.tip == 45) {
          $scope.numClick('3');
        } else if ($scope.tip == 38 || $scope.tip == 39 || $scope.tip == 46 || $scope.tip == 47) {
          $scope.opClick('-');
        } else if ($scope.tip == 48 || $scope.tip == 49 || $scope.tip == 56 || $scope.tip == 57) {
          $scope.numClick('0');
        } else if ($scope.tip == 50 || $scope.tip == 51 || $scope.tip == 58 || $scope.tip == 59) {
          $scope.numClick('0');
        } else if ($scope.tip == 52 || $scope.tip == 53 || $scope.tip == 60 || $scope.tip == 61) {
          $scope.opClick('=');
        } else if ($scope.tip == 54 || $scope.tip == 55 || $scope.tip == 62 || $scope.tip == 63) {
          $scope.opClick('+');
        }
      }
    });
  });


  // initialise.
  $scope.currentValue = 0;
  var resetState = function () {
    $scope.previousValue = 0;
    $scope.previousOperation = "+";
  }
  resetState();

  // called when a number button is clicked.
  $scope.numClick = function (num) {
    $scope.currentValue = parseInt($scope.currentValue.toString() + num);
    updateDisplay($scope.currentValue);
  }

  // called when an operation button is clicked.
  $scope.opClick = function (op) {
    // I don't like using eval... but this is super concise so forgive me.
    var res = parseInt(eval($scope.previousValue + $scope.previousOperation + $scope.currentValue));
    $scope.currentValue = 0;
    // special case
    if (op == "=") {
      resetState();
    } else {
      $scope.previousValue = res;
      $scope.previousOperation = op;
    }
    // division by 0 case. (or any other thing actually)
    if (isNaN(res)) {
      res = "error";
    }
    updateDisplay(res);
  }

  var updateDisplay = function (str) {
    $scope.display = str;
  }
  updateDisplay("0");

}]);
