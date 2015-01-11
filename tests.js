var expect = require('expect.js');
var hoook = require('./index');

describe('hoook', function() {

  it('should respect the priority', function(done) {
    var ee = hoook();

    ee.hook('foo', function(ev) {
      expect(ev.last).to.be.equal(200);
      ev.last = 100;
    }, 100);

    ee.hook('foo', function(ev) {
      expect(ev.last).to.be.equal(void 0);
      ev.last = 300;
    }, 300);

    ee.hook('foo', function(ev) {
      expect(ev.last).to.be.equal(300);
      ev.last = 200;
    }, 200);

    ee.fire('foo', function(err, ev) {
      expect(ev.last).to.be.equal(100);
      done();
    });
  });

  it('should process equal priorities in the order they where added', function(done) {
    var ee = hoook();
    var c = 0;

    ee.hook('foo', function(ev) {
      expect(c).to.be.equal(0);
      c++;
    });

    ee.hook('foo', function(ev) {
      expect(c).to.be.equal(1);
      c++;
    });

    ee.hook('foo', function(ev) {
      expect(c).to.be.equal(2);
      done();
    });

    ee.fire('foo');
  });

  it('should run async', function(done) {
    var ee = hoook();

    var cb = function(ev, next) {
      setTimeout(function() {
        ev.val++;
        next();
      }, 10);
    };

    ee.hook('foo', cb);
    ee.hook('foo', cb);

    ee.fire('foo', { val: 0 }, function(err, ev) {
      expect(ev.val).to.be.equal(2);
      done();
    });
  });

  it('should abort the middleware-chain with errors', function(done) {
    var ee = hoook();

    ee.hook('foo', function(ev, next, stop) {
      stop(new Error('abort'));
    });

    ee.hook('foo', function(ev, next) {
    });

    ee.fire('foo', {}, function(err, ev) {
      expect(err.toString()).to.be.equal('Error: abort');
      expect(ev).to.be.equal(void 0);
      done();
    });
  });

  it('should abort the middleware-chain without errors', function(done) {
    var ee = hoook();

    ee.hook('foo', function(ev, next, stop) {
      stop();
    });

    ee.hook('foo', function(ev, next) {
    });

    ee.fire('foo', { val: 1 }, function(err, ev) {
      expect(err).to.be.equal(null);
      expect(ev.val).to.be.equal(1);
      done();
    });
  });

  it('should unhook the callback', function(done) {
    var ee = hoook();
    var cb = function(ev) {
      ev.val++;
    };

    ee.hook('foo', cb);
    ee.unhook('foo', cb);

    ee.fire('foo', { val: 0 }, function(err, ev) {
      expect(ev.val).to.be.equal(0);
      done();
    });
  });

  it('should unhook all callbacks of a certain type', function(done) {
    var ee = hoook();
    var cb = function(ev) {
      ev.val++;
    };

    ee.hook('foo', cb);
    ee.hook('foo', cb);

    ee.unhook('foo');

    ee.fire('foo', { val: 0 }, function(err, ev) {
      expect(ev.val).to.be.equal(0);
      done();
    });
  });

  it('should unhook all callbacks', function(done) {
    var ee = hoook();
    var cb = function(ev) {
      ev.val++;
    };

    ee.hook('foo', cb);
    ee.hook('foo', cb);

    ee.unhook();

    ee.fire('foo', { val: 0 }, function(err, ev) {
      expect(ev.val).to.be.equal(0);
      done();
    });
  });

});
