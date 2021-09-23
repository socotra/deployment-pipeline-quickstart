"use strict";

function polyfill()
{
  // For flat() and flatMap() see https://github.com/jonathantneal/array-flat-polyfill
  if (!Array.prototype.flat)
  {
    Object.defineProperty(Array.prototype, 'flat', {
      configurable: true,
      value: function flat () {
        var depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
        return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
          if (Array.isArray(cur))
            acc.push.apply(acc, flat.call(cur, depth - 1));
          else
            acc.push(cur);
          return acc;
        }, []) : Array.prototype.slice.call(this);
      },
      writable: true
    });
  }
  if (!Array.prototype.flatMap)
  {
    Object.defineProperty(Array.prototype, 'flatMap', {
      configurable: true,
      value: function flatMap (mapFn) {
        return Array.prototype.map.apply(this, arguments).flat();
      },
      writable: true
    });
  }
  if (!Array.prototype.groupBy)
  {
    Object.defineProperty(Array.prototype, 'groupBy', {
      configurable: true,
      value: function groupBy(keyFn, valFn) {
        return Array.prototype.reduce.call(this, function (map, item) {
          let key = keyFn(item);
          let arr = map.has(key) ? map.get(key) : [];
          arr.push(valFn(item));
          map.set(key, arr);
          return map;
        }, new Map());
      }
    });
  }
  if (!Array.prototype.sum)
  {
    Object.defineProperty(Array.prototype, 'sum', {
      configurable: true,
      value: function sum(evalFn = x => x) {
        return this.reduce((sum, x) => sum + evalFn(x), 0);
      }
    });
  }
  if (!Array.prototype.min)
  {
    Object.defineProperty(Array.prototype, 'min', {
      configurable: true,
      value: function min(evalFn = x => x) {
          return this.reduce((min, x) => Math.min(evalFn(x), min), Infinity)
      }
    });
  }
  if (!Array.prototype.max)
  {
    Object.defineProperty(Array.prototype, 'max', {
      configurable: true,
      value: function max(evalFn = x => x) {
        return this.reduce((max, x) => Math.max(evalFn(x), max), -Infinity)
      }
    });
  }
  if (!Array.prototype.count)
  {
    Object.defineProperty(Array.prototype, 'count', {
      configurable: true,
      value: function count(evalFn) {
        return (evalFn == null) ? this.length : this.filter(evalFn).length;
      }
    });
  }
}
function getIntVal(arg, defaultVal = 0)
{
  if (arg == null)
    return defaultVal;
  else if (Array.isArray(arg))
    return parseInt(arg[0], 10);
  else
    return parseInt(arg, 10);
}
function getFloatVal(arg, defaultVal = 0.0)
{
  if (arg == null)
    return defaultVal;
  else if (Array.isArray(arg))
    return parseFloat(arg[0]);
  else
    return parseFloat(arg);
}
function round2(num) {
  return Math.round(num * 100) / 100.0;
}
function isNear(num1, num2) {
  return Math.abs(num1 - num2) < 0.00000001;
}

exports.polyfill = polyfill;
exports.getIntVal = getIntVal;
exports.getFloatVal = getFloatVal;
exports.round2 = round2;
exports.isNear = isNear;
