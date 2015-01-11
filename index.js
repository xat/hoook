
var Hoook = function() {
  var listeners = {};

  return {

    fire: function(name, ev, cb) {
      var stack;

      if (is(ev, 'function')) {
        cb = ev;
        ev = {};
      } else if (is(ev, 'undefined')) {
        ev = {};
      }

      if (!is(cb, 'function')) cb = noop;

      stack = listeners[name] ? cloneArray(listeners[name]) : [];

      // abort the middleware-chain
      // and jump to the final callback
      var stop = function(err) {
        if (err) return cb(err);
        cb(null, ev);
      };

      // jump to the next middleware
      var next = function(err) {
        if (err) return cb(err);
        if (!stack.length) {
          cb(null, ev);
          return;
        }
        stack.shift().cb(ev, next, stop);
      };

      return next();
    },

    hook: function(name, cb, prio) {
      var stack;

      if (!listeners[name]) listeners[name] = [];
      if (is(prio, 'undefined')) prio = 100;

      stack = cloneArray(listeners[name]);

      stack.push({
        prio: prio,
        fn: cb,
        cb: wrap(cb)
      });

      stack.sort(function(a, b) {
        return b.prio - a.prio;
      });

      listeners[name] = stack;
    },

    unhook: function(name, fn) {
      var c;

      if (!name) {
        listeners = {};
        return;
      }

      if (!fn) {
        listeners[name] = [];
        return;
      }

      c = listeners[name].length;

      while (c--) {
        if (listeners[name][c].fn === fn) {
          listeners[name].splice(c, 1);
        }
      }
    }

  };
};

var noop = function() {};

var cloneArray = function(arr) {
  return [].slice.call(arr);
};

var is = function(val, type) {
  return typeof val === type;
};

var wrap = function(fn) {
  if (fn.length >= 2) return fn;
  return function(ev, next) {
    fn(ev);
    next();
  };
};

module.exports = Hoook;
