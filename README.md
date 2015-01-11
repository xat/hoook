# hoook

hoook is an event emitter with async and priority support.
Since hoook works a bit differently compared to "normal" event emitters
the methods are named `fire`, `hook` and `unhook` instead of the known `emit`, `on`
and `off`.

### Usage
```javascript
var hoook = require('hoook');

// create a new object
var ee = hoook();

// hook with priority 50.
// higher priorities will run first.
ee.hook('foo', function(ev) {
  // do something like sticking data
  // to the event object..
  ev.bar = 'middleware got called';
}, 50);

// by default the priority is 100.
// higher priority hooks will run
// before lower ones.
ee.hook('foo', function(ev) {
  // do something...
});

// if the callback has two or more
// arguments it is considered an
// async hook.
ee.hook('foo', function(ev, next) {
  setTimeout(function() {
    // jump to the next middleware
    // once finished.
    next();
  }, 1000);
});

// the middleware-chain can be aborted
ee.hook('foo', function(ev, next, stop) {
  // jump directly to the final callback
  stop();
});

// ...or you can abort it with an error
ee.hook('foo', function(ev, next, stop) {
  stop(new Error('something went wrong'));
});

// emitting an event is as easy as
ee.fire('foo');

// pass in a callback which will be
// called once the callback chain has finished
ee.fire('foo', function(err, ev) {
  if (err) {
    // if the middleware-chain was aborted with an error.
    // in this case ev will be undfined
  }
});

// defining the ev object goes like this:
ee.fire('foo', { type: 'myEvent' }, function(err, ev) {
  // by default ev is an empty object {}.
});

```

### Installation

`npm install hoook`

## License
MIT
