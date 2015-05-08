angular.module('ezpzeApp')

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

  res.resetGrid = function () {
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
              width: 0 + 'px',
              height: 0 + 'px',
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

}]);