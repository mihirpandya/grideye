angular.module('ezpzeApp')

.controller('HomeCtrl', [ '$scope', 'GridService', 'SocketService', '$location',
  function ($scope, GridService, SocketService, $location) {

    $scope.DEBUG = false;

    console.log($location.path());
    if ($location.path() !== '/arr') {
      var params = {};
      params['squareLegnth'] = 100;
      params['onSize'] = 80;
      params['offSize'] = 0;
      params['onBgColor'] = 'rgba(255, 255, 255, 0)';
      params['onBgColor'] = 'rgba(255, 255, 255, 0)';
      GridService.init();
    }

    $scope.grid = GridService.getGrid();
    $scope.touch = GridService.getTouch();
    $scope.calibrating = GridService.isCalibrating();
    $scope.tapped = GridService.getTapped();

    SocketService.socket.on('connect', function () {
      SocketService.socket.emit('startUpdate', {data: 'I\'m connected!'});
    });

    SocketService.socket.on('updateArray', function (data) {
      $scope.$apply(function () {
        GridService.update(data);
        $scope.grid = GridService.getGrid();
        $scope.touch = GridService.getTouch();
        $scope.calibrating = GridService.isCalibrating();
        $scope.tapped = GridService.getTapped();
        // if (GridService.getCoffee()) {
        //   $location.path("http://www.ecebros.com/549");
        // }
      });
    });

  }])

.controller('FingerTipCtrl', [ '$scope', 'GridService', 'SocketService', '$location',
  function ($scope, GridService, SocketService, $location) {

      // var params = {};
      // params['squareLegnth'] = 100;
      // params['onSize'] = 80;
      // params['offSize'] = 0;
      // params['onBgColor'] = 'rgba(255, 255, 255, 0)';
      // params['onBgColor'] = 'rgba(255, 255, 255, 0)';
      // GridService.init();

    // $scope.grid = GridService.getGrid();
    // $scope.touch = GridService.getTouch();
    // $scope.calibrating = GridService.isCalibrating();
    // $scope.tapped = GridService.getTapped();

    var UNIT_SIZE = 80;

    $scope.grid = [];
    for (var i = 0; i < 8; i++) {
      $scope.grid.push([]);
      for (var j = 0; j < 8; j++) {
        $scope.grid[i][j] = i * 8 + j;
      }
    }

    var setFingerTipStyle = function (fingerTip) {
      $scope.fingerTipStyle = {
        top: (fingerTip.y * UNIT_SIZE - UNIT_SIZE / 2).toString() + 'px',
        left: (fingerTip.x * UNIT_SIZE - UNIT_SIZE / 2).toString() + 'px',
      };
    };

    setFingerTipStyle({
      x: 0,
      y: 0
    });

    SocketService.socket.on('connect', function () {
      SocketService.socket.emit('startUpdate', {data: 'I\'m connected!'});
    });

    SocketService.socket.on('updateArray', function (data) {
      $scope.$apply(function () {
        GridService.update(data);
        setFingerTipStyle(GridService.getFingerTipPixel())
        // $scope.grid = GridService.getGrid();
        // $scope.touch = GridService.getTouch();
        // $scope.calibrating = GridService.isCalibrating();
        // $scope.tapped = GridService.getTapped();
        // if (GridService.getCoffee()) {
          // $location.path("http://www.ecebros.com/549");
        // }
      });
    });

  }])

.controller('CalculatorCtrl', [ '$scope', 'GridService', 'SocketService',
  function ($scope, GridService, SocketService) {

    $scope.touch = GridService.getTouch();
    $scope.calibrating = GridService.isCalibrating();
    $scope.calibrating = false;
    $scope.tapped = GridService.getTapped();

    GridService.resetGrid();

    $scope.tip;

    var UNIT_SIZE = 150;

    var setFingerTipStyle = function (fingerTip) {
      $scope.fingerTipStyle = {
        top: (fingerTip.y * UNIT_SIZE - UNIT_SIZE / 2).toString() + 'px',
        left: (fingerTip.x * UNIT_SIZE - UNIT_SIZE / 2).toString() + 'px',
      };
    };

    setFingerTipStyle({
      x: 0,
      y: 0
    });

    var touchElement = document.getElementById("jam");

    SocketService.socket.on('updateArray', function (data) {
      $scope.$apply(function () {
        GridService.update(data);
        $scope.touch = GridService.getTouch();
        $scope.calibrating = GridService.isCalibrating();
        $scope.tapped = GridService.getTapped();
        var fingerTip = GridService.getFingerTipPixel();
        setFingerTipStyle(fingerTip);
        if (GridService.didTap()) {
          console.log('tapped');
          $scope.tip = GridService.getTipIndex();
          console.log(GridService.getTipIndex());
          jam.click();

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
