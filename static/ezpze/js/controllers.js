angular.module('ezpzeApp')

.controller('HomeCtrl', [ '$scope', 'GridService', 'SocketService', '$location',
  function ($scope, GridService, SocketService, $location) {

    $scope.DEBUG = false;

    $scope.grid = GridService.getGrid();
    $scope.touch = GridService.getTouch();
    $scope.calibrating = GridService.getCalibrating();
    $scope.tapped = GridService.getTapped();

    console.log($location.path());
    if ($location.path() !== '/arr') {
      GridService.setGridParams(100, 80, 0, 'transparent', 'transparent');
    }

    SocketService.socket.on('connect', function () {
      Socket.socket.emit('startUpdate', {data: 'I\'m connected!'});
    });

    SocketService.socket.on('updateArray', function (data) {
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

.controller('CalculatorCtrl', [ '$scope', 'GridService', 'SocketService',
  function ($scope, GridService, SocketService) {

    $scope.grid = GridService.getGrid();
    $scope.touch = GridService.getTouch();
    $scope.calibrating = GridService.getCalibrating();
    $scope.calibrating = false;
    $scope.tapped = GridService.getTapped();

    GridService.setGridParams(75, 0, 0, 'transparent', 'transparent');

    GridService.resetGrid();

    $scope.tip;

    SocketService.socket.on('updateArray', function (data) {
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
