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
  var CALIBRATION_COUNT = 20;
  var RESET_MODE = 'reset';
  var CALIBRATION_MODE = 'calibration';
  var OPERATION_MODE = 'operation';

  that.calibrating = true;
  that.tapped = false;
  var iterations = 0;


  var getOffsetsFromDiameter = function (d) {
    return (SQUARE_LENGTH - d) / 2;
  }

  that.grid = [];
  that.touch = {};

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

  var updateGrid = function (mode, grid) {
    var heatIndex, offset, size, on;
    var foundTip = false;
    for (var i = 0; i < 8; i++) {
      if (mode === RESET_MODE) {
        that.grid.push([]);
      }
      for (var j = 0; j < 8; j++) {
        if (mode === RESET_MODE) {
          heatIndex = 20;
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
              left: offset + 'px'
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
          size = on ? 80 : 20;
          offset = getOffsetsFromDiameter(size);
          that.grid[i][j].style = {
            width: size + 'px',
            height: size + 'px',
            top: offset + 'px',
            left: offset + 'px'
          }
          if (!foundTip && on) {
            that.grid[i][j].style.backgroundColor = 'red';
            foundTip = true;
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

.controller('HomeCtrl', [ '$scope', 'GridService', function ($scope, GridService) {

  // $scope.DEBUG = false;

  // var SQUARE_LENGTH = 100;
  // var CALIBRATION_COUNT = 20;
  // var RESET_MODE = 'reset';
  // var CALIBRATION_MODE = 'calibration';
  // var OPERATION_MODE = 'operation';

  $scope.calibrating = true;
  $scope.tapped = false;
  // var iterations = 0;


  // var getOffsetsFromDiameter = function (d) {
  //   return (SQUARE_LENGTH - d) / 2;
  // }

  $scope.grid = GridService.getGrid();
  $scope.touch = GridService.getTouch();
  $scope.calibrating = GridService.getCalibrating();
  $scope.tapped = GridService.getTapped();

  // var updateGrid = function (mode, grid) {
  //   var heatIndex, offset, size, on;
  //   var foundTip = false;
  //   for (var i = 0; i < 8; i++) {
  //     if (mode === RESET_MODE) {
  //       $scope.grid.push([]);
  //     }
  //     for (var j = 0; j < 8; j++) {
  //       if (mode === RESET_MODE) {
  //         heatIndex = 20;
  //       } else {
  //         heatIndex = grid[i][j]; // 0~255
  //       }

  //       if (mode === RESET_MODE) {
  //         offset = getOffsetsFromDiameter(heatIndex);
  //         $scope.grid[i].push({
  //           id: i*8+j,
  //           threshold: {
  //             total: 0,
  //             min: 255,
  //             av: 128,
  //             max: 0,
  //             range: 0
  //           },
  //           style: {
  //             width: heatIndex + 'px',
  //             height: heatIndex + 'px',
  //             top: offset + 'px',
  //             left: offset + 'px'
  //           },
  //           heatIndex: undefined
  //         });
  //       }
  //       else if (mode === CALIBRATION_MODE) {
  //         $scope.grid[i][j].heatIndex = heatIndex;
  //         $scope.grid[i][j].threshold = {
  //           total: $scope.grid[i][j].threshold.total + heatIndex,
  //           min: Math.min($scope.grid[i][j].threshold.min, heatIndex),
  //           av: ($scope.grid[i][j].threshold.total + heatIndex) / iterations,
  //           max: Math.max($scope.grid[i][j].threshold.max, heatIndex),
  //           range: $scope.grid[i][j].threshold.max - $scope.grid[i][j].threshold.min
  //         };
  //       }
  //       else if (mode === OPERATION_MODE) {
  //         $scope.grid[i][j].heatIndex = heatIndex;
  //         on = heatIndex > ($scope.grid[i][j].threshold.max + 4) && $scope.tapped;
  //         size = on ? 80 : 20;
  //         offset = getOffsetsFromDiameter(size);
  //         $scope.grid[i][j].style = {
  //           width: size + 'px',
  //           height: size + 'px',
  //           top: offset + 'px',
  //           left: offset + 'px'
  //         }
  //         if (!foundTip && on) {
  //           $scope.grid[i][j].style.backgroundColor = 'red';
  //           foundTip = true;
  //         }
  //       }

  //     }
  //   }
  // }

  // var updateTouch = function (mode, volts) {
  //   if (mode === RESET_MODE) {
  //     $scope.touch = {
  //       total: 0,
  //       min: 255,
  //       av: 128,
  //       max: 0,
  //       range: 0,
  //       on: false
  //     };
  //   }
  //   else if (mode === CALIBRATION_MODE) {
  //     $scope.touch = {
  //       volts: volts,
  //       total: $scope.touch.total + volts,
  //       min: Math.min($scope.touch.min, volts),
  //       av: ($scope.touch.total + volts) / iterations,
  //       max: Math.max($scope.touch.max, volts),
  //       range: $scope.touch.max - $scope.touch.min
  //     };
  //   }
  //   else if (mode === OPERATION_MODE) {
  //     $scope.touch.volts = volts;
  //     $scope.touch.on = volts > 0.05 ? true : false;
  //     if ($scope.touch.on) {
  //       $scope.tapped = !$scope.tapped;
  //     }
  //   }
  // }

  // updateGrid(RESET_MODE);
  // updateTouch(RESET_MODE);

  socket.on('updateArray', function (data) {
    $scope.$apply(function () {
      GridService.update(data);
  	});
  });

  // socket.on('updateArray', function(data) {
  //   $scope.$apply(function () {
  //     iterations++;
  //     var volts = data.volts;
  //     var grid = data.arr;

  //     if (iterations <= CALIBRATION_COUNT) {
  //       updateGrid(CALIBRATION_MODE, grid);
  //       updateTouch(CALIBRATION_MODE, volts);
  //       if (iterations == CALIBRATION_COUNT) {
  //         $scope.calibrating = false;
  //       }
  //     } else {
  //       updateGrid(OPERATION_MODE, grid);
  //       updateTouch(OPERATION_MODE, volts);
  //     }
  //  });
  // });

}])

// .controller('CalculatorCtrl', [ '$scope', function ($scope) {

//   // initialise.
//   $scope.currentValue = 0;
//   var resetState = function(){
//     $scope.previousValue = 0;
//     $scope.previousOperation = "+";
//   }
//   resetState();

//   // called when a number button is clicked.
//   $scope.numClick = function(num){
//     $scope.currentValue = parseInt($scope.currentValue.toString() + num);
//     updateDisplay($scope.currentValue);
//   }

//   // called when an operation button is clicked.
//   $scope.opClick = function(op){
//     // I don't like using eval... but this is super concise so forgive me.
//     var res = parseInt(eval($scope.previousValue + $scope.previousOperation + $scope.currentValue));
//     $scope.currentValue = 0;
//     // special case
//     if (op == "="){
//       resetState();
//     } else {
//       $scope.previousValue = res;
//       $scope.previousOperation = op;
//     }
//     // division by 0 case. (or any other thing actually)
//     if (isNaN(res)){
//       res = "error";
//     }
//     updateDisplay(res);
//   }

//   var updateDisplay = function(str){
//     // document.getElementById("display").innerHTML = str;
//     $scope.display = str;
//   }
//   updateDisplay("0");

// }]);
