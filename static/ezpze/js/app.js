var socket = io.connect('http:' + document.domain + ':' + location.port);
console.log('Connected to http:' + document.domain + ':' + location.port);

socket.on('connect', function() {
    socket.emit('startUpdate', {data: 'I\'m connected!'});
});

// var updateIterations = 0;
// var curMin, curMax;
// var range, ghettoMedian;
// var amp;
// var mappedRange, amplifiedValue;
// var MAX_R_VALUE = 255;

// socket.on('updateArray', function(data) {
//   updateIterations++;
//   var node, c, size, allData;
//   allData = data
//   data = allData['arr']
//   //node = document.getElementById(data);
//    c = 100;

//    if (updateIterations <= 20) {
//     if (!curMin || c < curMin) {
//       curMin = c;
//     }
//     if (!curMax ||c > curMax) {
//       curMax = c;
//     }
//    }

//    if (updateIterations > 20) {
//      ghettoMedian = (curMin + curMax) / 2;
//      amp =  MAX_R_VALUE / (curMax - curMin);

//      amplifiedValue = ghettoMedian + (c - ghettoMedian) * amp;
//      var px = ~~(amplifiedValue / 14);

//     //node.style.backgroundColor = 'rgb('+'255'+',0,0)';
//      //node.style.width = (100 + px*2).toString() + "px";
//      //node.style.height = (100 + px*2).toString() + "px";
//      //node.style.margin = (20 - px).toString() + "px";

//    }

//    for (i = 0; i < data.length; i++) {
//     for (j = 0; j < data[i].length; j++) {
//       node = document.getElementById(8*i+j)
//       c = data[i][j]

//       if (updateIterations <= 20) {
//         if (!curMin || c < curMin) {
//           curMin = c;
//         }
//         if (!curMax ||c > curMax) {
//           curMax = c;
//         }
//       }

//       if (updateIterations > 20) {
//         ghettoMedian = (curMin + curMax) / 2;
//         amp =  MAX_R_VALUE / (curMax - curMin);

//         amplifiedValue = ghettoMedian + (c - ghettoMedian) * amp;
//         var px = ~~(amplifiedValue / 14);

//         node.style.backgroundColor = 'rgb('+amplifiedValue+',0,0)'
//         node.style.width = (100 + px*2).toString() + "px";
//         node.style.height = (100 + px*2).toString() + "px";
//         node.style.margin = (20 - px).toString() + "px";

//       }
//     }
//    }
// });


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

  $scope.calibrating = true;
  var iterations = 0;

  var SQUARE_LENGTH = 100;
  var RESET_MODE = 'reset';
  var CALIBRATION_MODE = 'calibration';
  var OPERATION_MODE = 'operation';


  var getOffsetsFromDiameter = function (d) {
    return (SQUARE_LENGTH - d) / 2;
  }

  $scope.grid = [];

  var updateGrid = function (mode, grid) {
    var heatIndex, offset, size;
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
              min: 0,
              av: 128,
              max: 0,
            },
            style: {
              width: heatIndex + 'px',
              height: heatIndex + 'px',
              top: offset + 'px',
              left: offset + 'px'
            }
          });
        }
        else if (mode === CALIBRATION_MODE) {
          $scope.grid[i][j].threshold = {
            total: $scope.grid[i][j].threshold.total + heatIndex,
            min: Math.min($scope.grid[i][j].threshold.min, heatIndex),
            av: ($scope.grid[i][j].threshold.total + heatIndex) / iterations,
            max: Math.max($scope.grid[i][j].threshold.max, heatIndex),
          };
        }
        else if (mode === OPERATION_MODE) {
          size = heatIndex > $scope.grid[i][j].threshold.max + 5 ? 80 : 20;
          offset = getOffsetsFromDiameter(size);
          $scope.grid[i][j].style = {
            width: size + 'px',
            height: size + 'px',
            top: offset + 'px',
            left: offset + 'px'
          }
        }

      }
    }
  }

  updateGrid(RESET_MODE);

  var calibrateTouch = function (volts) {
    // body...
  }

  socket.on('updateArray', function(data) {

    $scope.$apply(function () {

    iterations++;

    var volts = data.volts;
    var grid = data.arr;
    if (iterations <= 20) {
      updateGrid(CALIBRATION_MODE, grid);
      if (iterations == 20) {
$scope.calibrating = false;
      }
      // calibrateTouch(volts);
    } else {
      updateGrid(OPERATION_MODE, grid);
    }
	});
  });

}]);
