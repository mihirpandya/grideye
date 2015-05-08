angular.module('ezpzeApp')

.factory('GridService', [ function () {

  var DEBUG = false;

  var RESET_MODE = 'reset';
  var CALIBRATION_MODE = 'calibration';
  var OPERATION_MODE = 'operation';
  var ON_THRESHOLD = 4;
  var COFFEE_THRESHOLD = 170;
  var ON_VOLTAGE = 0.05;

  var params = {};

  (function () {
    params['squareLength'] = 100;
    params['onSize'] = 80;
    params['offSize'] = 20;
    params['onBgColor'] = '#A0A0A0';
    params['onBgColor'] = '#A0A0A0';
    params['calibrationCount'] = 20;
    params['smoothening'] = 3;
  })();

  var system = {};
  system.calibrating = true;
  system.tapped = false;
  system.didTap = false;
  system.tipIndex = undefined;
  system.coffee = false;
  system.grid = [];
  system.touch = {};
  system.iterations = 0;
  system.fingerTipQueue = [];

  // interntal functions

  var getOffsetsFromDiameter = function (d) {
    return (params['squareLength'] - d) / 2;
  }

  // newTip = {x: someVal, y: someVal};
  var updateFingerTip = function (newTip) {
    if (system.fingerTipQueue.length >=params['smoothening']) {
      system.fingerTipQueue.shift();
    }
    system.fingerTipQueue.push(newTip);
  }

  var updateGrid = function (mode, grid) {
    var heatIndex, offset, size, on, color;
    var foundTip = false;
    if (mode === RESET_MODE) {
      system.grid = [];
    }
    for (var i = 0; i < 8; i++) {
      if (mode === RESET_MODE) {
        system.grid.push([]);
      }
      for (var j = 0; j < 8; j++) {
        if (mode === RESET_MODE) {
          heatIndex = params['offSize'];
        } else {
          heatIndex = grid[i][j]; // 0~255
        }

        if (mode === RESET_MODE) {
          offset = getOffsetsFromDiameter(heatIndex);
          system.grid[i].push({
            id: i*8+j,
            threshold: {
              total: 0,
              min: 255,
              av: 128,
              max: 0,
              range: 0
            },
            style: {
              width: 0 + 'px',
              height: 0 + 'px',
              top: offset + 'px',
              left: offset + 'px',
              backgroundColor: params['offBgColor']
            },
            heatIndex: undefined
          });
        }
        else if (mode === CALIBRATION_MODE) {
          system.grid[i][j].heatIndex = heatIndex;
          system.grid[i][j].threshold = {
            total: system.grid[i][j].threshold.total + heatIndex,
            min: Math.min(system.grid[i][j].threshold.min, heatIndex),
            av: (system.grid[i][j].threshold.total + heatIndex) / system.iterations,
            max: Math.max(system.grid[i][j].threshold.max, heatIndex),
            range: system.grid[i][j].threshold.max - system.grid[i][j].threshold.min
          };
        }
        else if (mode === OPERATION_MODE) {
          system.grid[i][j].heatIndex = heatIndex;
          on = heatIndex > (system.grid[i][j].threshold.max + ON_THRESHOLD) && system.tapped;
          if (heatIndex > COFFEE_THRESHOLD) {
            system.coffee = true;
          }
          size = on ? params['onSize'] : params['offSize'];
          bgColor = on ? params['onBgColor'] : params['offBgColor'];
          offset = getOffsetsFromDiameter(size);
          system.grid[i][j].style = {
            width: size + 'px',
            height: size + 'px',
            top: offset + 'px',
            left: offset + 'px',
            backgroundColor: bgColor
          }
          if (!foundTip && on) {
            system.grid[i][j].style.backgroundColor = 'red';
            foundTip = true;
            system.tipIndex = i * 8 + j;
            updateFingerTip({
              x: i + 0.5,
              y: j + 0.5
            });
          }
        }

      }
    }
  }

  var updateTouch = function (mode, volts) {
    if (mode === RESET_MODE) {
      system.touch = {
        total: 0,
        min: 255,
        av: 128,
        max: 0,
        range: 0,
        on: false
      };
    }
    else if (mode === CALIBRATION_MODE) {
      system.touch = {
        volts: volts,
        total: system.touch.total + volts,
        min: Math.min(system.touch.min, volts),
        av: (system.touch.total + volts) / system.iterations,
        max: Math.max(system.touch.max, volts),
        range: system.touch.max - system.touch.min
      };
    }
    else if (mode === OPERATION_MODE) {
      system.touch.volts = volts;
      system.touch.on = volts > ON_VOLTAGE ? true : false;
      system.didTap = system.touch.on;
      if (system.touch.on) {
        system.tapped = !system.tapped;
      }
    }
  }

  updateGrid(RESET_MODE);
  updateTouch(RESET_MODE);

  return {

    init: function (newParams) {
      angular.forEach(newParams, function (value, key) {
        params[key] = value;
      });
    },

    resetGrid: function () {
      updateGrid(RESET_MODE);
      updateTouch(RESET_MODE);
    },

    update: function (data) {
      system.iterations++;
      var volts = data.volts;
      var grid = data.arr;
      if (system.iterations <= params['calibrationCount']) {
        updateGrid(CALIBRATION_MODE, grid);
        updateTouch(CALIBRATION_MODE, volts);
        if (system.iterations == params['calibrationCount']) {
          system.calibrating = false;
        }
      } else {
        updateGrid(OPERATION_MODE, grid);
        updateTouch(OPERATION_MODE, volts);
      }
    },

    isCalibrating: function () {
      return system.calibrating;
    },

    // should return (x, y) = 0~8
    getFingerTipPixel: function () {
      var total = {
        x: 0,
        y: 0
      };
      for (var i = 0; i < system.fingerTipQueue.length; i++) {
        total.x += system.fingerTipQueue[i].x;
        total.y += system.fingerTipQueue[i].y;
      }
      var averageFingerTip = {
        x: total.x / system.fingerTipQueue.length,
        y: total.y / system.fingerTipQueue.length
      };

      return averageFingerTip;
    },

    getGrid: function () {
      return system.grid;
    },

    getTouch: function () {
      return system.touch;
    },

    getCoffee: function () {
      return system.coffee;
    },

    getTapped: function () {
      return system.tapped;
    },

    didTap: function () {
      return system.didTap;
    },

    getTipIndex: function () {
      return system.tipIndex;
    }
  };

}]);