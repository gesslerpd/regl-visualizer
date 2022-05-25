(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var regl = require('regl')()
var analyse = require('web-audio-analyser')
var soundcloudBadge = require('soundcloud-badge')
var camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  theta: 0.717,
  phi: 0.717,
  distance: 3,
  damping: 0
})

var audio = document.createElement('audio')
audio.crossOrigin = 'anonymous'
audio.controls = true
audio.loop = true

var analyzer = analyse(audio, { audible: true, stereo: false })

var drawWaveform = regl({
  vert: `
    precision mediump float;
    attribute vec3 xyz;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xyz,1);
    }
  `,
  frag: `
    void main () {
      gl_FragColor = vec4(0,0.3333,1,1);
    }
  `,
  attributes: {
    xyz: () => Array.from(analyzer.waveform()).map((freq, i) => {
      return [0, (freq - 128) / 128, i / 1023 * 2 - 1]
    })
  },
  primitive: 'line strip',
  count: 1024
})

var drawFrequency = regl({
  vert: `
    precision mediump float;
    attribute vec3 xyz;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xyz,1);
    }
  `,
  frag: `
    void main () {
      gl_FragColor = vec4(0,1,0,1);
    }
  `,
  attributes: {
    xyz: () => Array.from(analyzer.frequencies()).slice(0, 256).map((freq, i) => {
      return [(freq) / 512, 0, i / 256 * 2 - 1]
    })
  },
  primitive: 'line strip',
  count: 256
})

regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] })
  camera(() => {
    drawWaveform()
    drawFrequency()
  })
})

var CLIENT_ID = '7g7gIkrcAS05cJVf2FlIsnkOXtg4JdSe'
var html = require('choo/html')
var choo = require('choo')

var app = choo()
app.use(playStore)
app.route('*', mainView)

var el = app.start()
el.appendChild(audio)
document.body.appendChild(el)

function mainView (state, emit) {
  return html`
    <div class="controls" onload=${onLoad}>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="SoundCloud URL">
      </form>
    </div>
  `

  function onSubmit (e) {
    const input = e.target.children[0]
    emit('play', input.value)
    input.value = ''
    e.preventDefault()
  }

  function onLoad () {
    emit('play', 'https://soundcloud.com/aquilo/human')
  }
}

function playStore (state, emitter) {
  state.trackDiv = undefined
  emitter.on('play', function (uri) {
    soundcloudBadge({
      client_id: CLIENT_ID,
      song: uri,
      dark: false,
      getFonts: false
    },
      function (err, src, data, div) {
        if (err) throw err
        var wasPlaying = !audio.paused
        audio.src = src
        audio.load()
        if (state.trackDiv) {
          state.trackDiv.remove()
        }
        if (wasPlaying) {
          audio.play()
        }
        state.trackDiv = div
      })
  })
}

},{"choo":10,"choo/html":9,"regl":45,"regl-camera":44,"soundcloud-badge":46,"web-audio-analyser":51}],2:[function(require,module,exports){
(function (global){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":36,"util/":5}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":40,"inherits":3}],6:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":15,"hyperx":19,"on-load":37}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],9:[function(require,module,exports){
module.exports = require('bel')

},{"bel":6}],10:[function(require,module,exports){
var documentReady = require('document-ready')
var nanohistory = require('nanohistory')
var nanorouter = require('nanorouter')
var nanomount = require('nanomount')
var nanomorph = require('nanomorph')
var nanohref = require('nanohref')
var nanoraf = require('nanoraf')
var nanobus = require('nanobus')
var assert = require('assert')

module.exports = Choo

function Choo (opts) {
  opts = opts || {}

  var routerOpts = {
    default: opts.defaultRoute || '/404',
    curry: true
  }

  var timingEnabled = opts.timing === undefined ? true : opts.timing
  var hasWindow = typeof window !== 'undefined'
  var hasPerformance = hasWindow && window.performance && window.performance.mark
  var router = nanorouter(routerOpts)
  var bus = nanobus()
  var rerender = null
  var tree = null
  var state = {}

  return {
    toString: toString,
    use: register,
    mount: mount,
    router: router,
    route: route,
    start: start
  }

  function route (route, handler) {
    router.on(route, function (params) {
      return function () {
        state.params = params
        return handler(state, emit)
      }
    })
  }

  function register (cb) {
    cb(state, bus)
  }

  function start () {
    if (opts.history !== false) {
      nanohistory(function (href) {
        bus.emit('pushState')
      })

      bus.prependListener('pushState', updateHistory.bind(null, 'push'))
      bus.prependListener('replaceState', updateHistory.bind(null, 'replace'))

      if (opts.href !== false) {
        nanohref(function (location) {
          var href = location.href
          var currHref = window.location.href
          if (href === currHref) return
          bus.emit('pushState', href)
        })
      }
    }

    function updateHistory (mode, href) {
      if (href) window.history[mode + 'State']({}, null, href)
      bus.emit('render')
      setTimeout(function () {
        scrollIntoView()
      }, 0)
    }

    rerender = nanoraf(function () {
      if (hasPerformance && timingEnabled) {
        window.performance.mark('choo:renderStart')
      }
      var newTree = router(createLocation())
      tree = nanomorph(tree, newTree)
      assert.notEqual(tree, newTree, 'choo.start: a different node type was returned as the root node on a rerender. Make sure that the root node is always the same type to prevent the application from being unmounted.')
      if (hasPerformance && timingEnabled) {
        window.performance.mark('choo:renderEnd')
        window.performance.measure('choo:render', 'choo:renderStart', 'choo:renderEnd')
      }
    })

    bus.prependListener('render', rerender)

    documentReady(function () {
      bus.emit('DOMContentLoaded')
    })

    tree = router(createLocation())

    return tree
  }

  function emit (eventName, data) {
    bus.emit(eventName, data)
  }

  function mount (selector) {
    var newTree = start()
    documentReady(function () {
      var root = document.querySelector(selector)
      assert.ok(root, 'choo.mount: could not query selector: ' + selector)
      nanomount(root, newTree)
      tree = root
    })
  }

  function toString (location, _state) {
    state = _state || {}
    var html = router(location)
    return html.toString()
  }
}

function scrollIntoView () {
  var hash = window.location.hash
  if (hash) {
    try {
      var el = document.querySelector(hash)
      if (el) el.scrollIntoView(true)
    } catch (e) {}
  }
}

function createLocation () {
  var pathname = window.location.pathname.replace(/\/$/, '')
  var hash = window.location.hash.replace(/^#/, '/')
  return pathname + hash
}

},{"assert":2,"document-ready":11,"nanobus":26,"nanohistory":27,"nanohref":28,"nanomorph":29,"nanomount":32,"nanoraf":33,"nanorouter":34}],11:[function(require,module,exports){
'use strict'

module.exports = ready

function ready (callback) {
  if (typeof document === 'undefined') {
    throw new Error('document-ready only runs in the browser')
  }
  var state = document.readyState
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(callback, 0)
  }

  document.addEventListener('DOMContentLoaded', function onLoad () {
    callback()
  })
}

},{}],12:[function(require,module,exports){
module.exports = identity;

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],13:[function(require,module,exports){
var identity = require('./identity');

module.exports = lookAt;

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < 0.000001 &&
        Math.abs(eyey - centery) < 0.000001 &&
        Math.abs(eyez - centerz) < 0.000001) {
        return identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};
},{"./identity":12}],14:[function(require,module,exports){
module.exports = perspective;

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};
},{}],15:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":7}],16:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
module.exports = asString
module.exports.add = append

function asString(fonts) {
  var href = getHref(fonts)
  return '<link href="' + href + '" rel="stylesheet" type="text/css">'
}

function asElement(fonts) {
  var href = getHref(fonts)
  var link = document.createElement('link')
  link.setAttribute('href', href)
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  return link
}

function getHref(fonts) {
  var family = Object.keys(fonts).map(function(name) {
    var details = fonts[name]
    name = name.replace(/\s+/, '+')
    return typeof details === 'boolean'
      ? name
      : name + ':' + makeArray(details).join(',')
  }).join('|')

  return 'http://fonts.googleapis.com/css?family=' + family
}

function append(fonts) {
  var link = asElement(fonts)
  document.head.appendChild(link)
  return link
}

function makeArray(arr) {
  return Array.isArray(arr) ? arr : [arr]
}

},{}],18:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],19:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        if (xstate === OPEN) {
          if (reg === '/') {
            p.push([ OPEN, '/', arg ])
            reg = ''
          } else {
            p.push([ OPEN, arg ])
          }
        } else if (xstate === COMMENT && opts.comments) {
          reg += String(arg)
        } else if (xstate !== COMMENT) {
          p.push([ VAR, xstate, arg ])
        }
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else parts[i][1]==="" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else parts[i][2]==="" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            if (parts[i][0] === CLOSE) {
              i--
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      if (opts.createFragment) return opts.createFragment(tree[2])
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN && reg.length) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && c === '/' && reg.length) {
          // no-op, self closing tag without a space <br/>
        } else if (state === OPEN && /\s/.test(c)) {
          if (reg.length) {
            res.push([OPEN, reg])
          }
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else if (x === null || x === undefined) return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":18}],20:[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}],21:[function(require,module,exports){

/**
 * Expose `render()`.`
 */

exports = module.exports = render;

/**
 * Expose `compile()`.
 */

exports.compile = compile;

/**
 * Render the given mustache `str` with `obj`.
 *
 * @param {String} str
 * @param {Object} obj
 * @return {String}
 * @api public
 */

function render(str, obj) {
  obj = obj || {};
  var fn = compile(str);
  return fn(obj);
}

/**
 * Compile the given `str` to a `Function`.
 *
 * @param {String} str
 * @return {Function}
 * @api public
 */

function compile(str) {
  var js = [];
  var toks = parse(str);
  var tok;

  for (var i = 0; i < toks.length; ++i) {
    tok = toks[i];
    if (i % 2 == 0) {
      js.push('"' + tok.replace(/"/g, '\\"') + '"');
    } else {
      switch (tok[0]) {
        case '/':
          tok = tok.slice(1);
          js.push(') + ');
          break;
        case '^':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", true, ');
          break;
        case '#':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", false, ');
          break;
        case '!':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + obj.' + tok + ' + ');
          break;
        default:
          assertProperty(tok);
          js.push(' + escape(obj.' + tok + ') + ');
      }
    }
  }

  js = '\n'
    + indent(escape.toString()) + ';\n\n'
    + indent(section.toString()) + ';\n\n'
    + '  return ' + js.join('').replace(/\n/g, '\\n');

  return new Function('obj', js);
}

/**
 * Assert that `prop` is a valid property.
 *
 * @param {String} prop
 * @api private
 */

function assertProperty(prop) {
  if (!prop.match(/^[\w.]+$/)) throw new Error('invalid property "' + prop + '"');
}

/**
 * Parse `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parse(str) {
  return str.split(/\{\{|\}\}/);
}

/**
 * Indent `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function indent(str) {
  return str.replace(/^/gm, '  ');
}

/**
 * Section handler.
 *
 * @param {Object} context obj
 * @param {String} prop
 * @param {String} str
 * @param {Boolean} negate
 * @api private
 */

function section(obj, prop, negate, str) {
  var val = obj[prop];
  if ('function' == typeof val) return val.call(obj, str);
  if (negate) val = !val;
  if (val) return str;
  return '';
}

/**
 * Escape the given `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],22:[function(require,module,exports){
'use strict'

module.exports = mouseListen

var mouse = require('mouse-event')

function mouseListen (element, callback) {
  if (!callback) {
    callback = element
    element = window
  }

  var buttonState = 0
  var x = 0
  var y = 0
  var mods = {
    shift: false,
    alt: false,
    control: false,
    meta: false
  }
  var attached = false

  function updateMods (ev) {
    var changed = false
    if ('altKey' in ev) {
      changed = changed || ev.altKey !== mods.alt
      mods.alt = !!ev.altKey
    }
    if ('shiftKey' in ev) {
      changed = changed || ev.shiftKey !== mods.shift
      mods.shift = !!ev.shiftKey
    }
    if ('ctrlKey' in ev) {
      changed = changed || ev.ctrlKey !== mods.control
      mods.control = !!ev.ctrlKey
    }
    if ('metaKey' in ev) {
      changed = changed || ev.metaKey !== mods.meta
      mods.meta = !!ev.metaKey
    }
    return changed
  }

  function handleEvent (nextButtons, ev) {
    var nextX = mouse.x(ev)
    var nextY = mouse.y(ev)
    if ('buttons' in ev) {
      nextButtons = ev.buttons | 0
    }
    if (nextButtons !== buttonState ||
      nextX !== x ||
      nextY !== y ||
      updateMods(ev)) {
      buttonState = nextButtons | 0
      x = nextX || 0
      y = nextY || 0
      callback && callback(buttonState, x, y, mods)
    }
  }

  function clearState (ev) {
    handleEvent(0, ev)
  }

  function handleBlur () {
    if (buttonState ||
      x ||
      y ||
      mods.shift ||
      mods.alt ||
      mods.meta ||
      mods.control) {
      x = y = 0
      buttonState = 0
      mods.shift = mods.alt = mods.control = mods.meta = false
      callback && callback(0, 0, 0, mods)
    }
  }

  function handleMods (ev) {
    if (updateMods(ev)) {
      callback && callback(buttonState, x, y, mods)
    }
  }

  function handleMouseMove (ev) {
    if (mouse.buttons(ev) === 0) {
      handleEvent(0, ev)
    } else {
      handleEvent(buttonState, ev)
    }
  }

  function handleMouseDown (ev) {
    handleEvent(buttonState | mouse.buttons(ev), ev)
  }

  function handleMouseUp (ev) {
    handleEvent(buttonState & ~mouse.buttons(ev), ev)
  }

  function attachListeners () {
    if (attached) {
      return
    }
    attached = true

    element.addEventListener('mousemove', handleMouseMove)

    element.addEventListener('mousedown', handleMouseDown)

    element.addEventListener('mouseup', handleMouseUp)

    element.addEventListener('mouseleave', clearState)
    element.addEventListener('mouseenter', clearState)
    element.addEventListener('mouseout', clearState)
    element.addEventListener('mouseover', clearState)

    element.addEventListener('blur', handleBlur)

    element.addEventListener('keyup', handleMods)
    element.addEventListener('keydown', handleMods)
    element.addEventListener('keypress', handleMods)

    if (element !== window) {
      window.addEventListener('blur', handleBlur)

      window.addEventListener('keyup', handleMods)
      window.addEventListener('keydown', handleMods)
      window.addEventListener('keypress', handleMods)
    }
  }

  function detachListeners () {
    if (!attached) {
      return
    }
    attached = false

    element.removeEventListener('mousemove', handleMouseMove)

    element.removeEventListener('mousedown', handleMouseDown)

    element.removeEventListener('mouseup', handleMouseUp)

    element.removeEventListener('mouseleave', clearState)
    element.removeEventListener('mouseenter', clearState)
    element.removeEventListener('mouseout', clearState)
    element.removeEventListener('mouseover', clearState)

    element.removeEventListener('blur', handleBlur)

    element.removeEventListener('keyup', handleMods)
    element.removeEventListener('keydown', handleMods)
    element.removeEventListener('keypress', handleMods)

    if (element !== window) {
      window.removeEventListener('blur', handleBlur)

      window.removeEventListener('keyup', handleMods)
      window.removeEventListener('keydown', handleMods)
      window.removeEventListener('keypress', handleMods)
    }
  }

  // Attach listeners
  attachListeners()

  var result = {
    element: element
  }

  Object.defineProperties(result, {
    enabled: {
      get: function () { return attached },
      set: function (f) {
        if (f) {
          attachListeners()
        } else {
          detachListeners()
        }
      },
      enumerable: true
    },
    buttons: {
      get: function () { return buttonState },
      enumerable: true
    },
    x: {
      get: function () { return x },
      enumerable: true
    },
    y: {
      get: function () { return y },
      enumerable: true
    },
    mods: {
      get: function () { return mods },
      enumerable: true
    }
  })

  return result
}

},{"mouse-event":23}],23:[function(require,module,exports){
'use strict'

function mouseButtons(ev) {
  if(typeof ev === 'object') {
    if('buttons' in ev) {
      return ev.buttons
    } else if('which' in ev) {
      var b = ev.which
      if(b === 2) {
        return 4
      } else if(b === 3) {
        return 2
      } else if(b > 0) {
        return 1<<(b-1)
      }
    } else if('button' in ev) {
      var b = ev.button
      if(b === 1) {
        return 4
      } else if(b === 2) {
        return 2
      } else if(b >= 0) {
        return 1<<b
      }
    }
  }
  return 0
}
exports.buttons = mouseButtons

function mouseElement(ev) {
  return ev.target || ev.srcElement || window
}
exports.element = mouseElement

function mouseRelativeX(ev) {
  if(typeof ev === 'object') {
    if('offsetX' in ev) {
      return ev.offsetX
    }
    var target = mouseElement(ev)
    var bounds = target.getBoundingClientRect()
    return ev.clientX - bounds.left
  }
  return 0
}
exports.x = mouseRelativeX

function mouseRelativeY(ev) {
  if(typeof ev === 'object') {
    if('offsetY' in ev) {
      return ev.offsetY
    }
    var target = mouseElement(ev)
    var bounds = target.getBoundingClientRect()
    return ev.clientY - bounds.top
  }
  return 0
}
exports.y = mouseRelativeY

},{}],24:[function(require,module,exports){
'use strict'

var toPX = require('to-px')

module.exports = mouseWheelListen

function mouseWheelListen(element, callback, noScroll) {
  if(typeof element === 'function') {
    noScroll = !!callback
    callback = element
    element = window
  }
  var lineHeight = toPX('ex', element)
  var listener = function(ev) {
    if(noScroll) {
      ev.preventDefault()
    }
    var dx = ev.deltaX || 0
    var dy = ev.deltaY || 0
    var dz = ev.deltaZ || 0
    var mode = ev.deltaMode
    var scale = 1
    switch(mode) {
      case 1:
        scale = lineHeight
      break
      case 2:
        scale = window.innerHeight
      break
    }
    dx *= scale
    dy *= scale
    dz *= scale
    if(dx || dy || dz) {
      return callback(dx, dy, dz, ev)
    }
  }
  element.addEventListener('wheel', listener)
  return listener
}

},{"to-px":48}],25:[function(require,module,exports){
assert.notEqual = notEqual
assert.notOk = notOk
assert.equal = equal
assert.ok = assert

module.exports = assert

function equal (a, b, m) {
  assert(a == b, m) // eslint-disable-line eqeqeq
}

function notEqual (a, b, m) {
  assert(a != b, m) // eslint-disable-line eqeqeq
}

function notOk (t, m) {
  assert(!t, m)
}

function assert (t, m) {
  if (!t) throw new Error(m || 'AssertionError')
}

},{}],26:[function(require,module,exports){
var nanotiming = require('nanotiming')
var assert = require('assert')

module.exports = Nanobus

function Nanobus (name) {
  if (!(this instanceof Nanobus)) return new Nanobus(name)

  this._name = name || 'nanobus'
  this._starListeners = []
  this._listeners = {}

  this._timing = nanotiming(this._name)
}

Nanobus.prototype.emit = function (eventName, data) {
  assert.equal(typeof eventName, 'string', 'nanobus.emit: eventName should be type string')

  this._timing.start(eventName)
  var listeners = this._listeners[eventName]
  if (listeners && listeners.length > 0) {
    this._emit(this._listeners[eventName], data)
  }

  if (this._starListeners.length > 0) {
    this._emit(this._starListeners, eventName, data)
  }
  this._timing.end(eventName)

  return this
}

Nanobus.prototype.on = Nanobus.prototype.addListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.on: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.on: listener should be type function')

  if (eventName === '*') {
    this._starListeners.push(listener)
  } else {
    if (!this._listeners[eventName]) this._listeners[eventName] = []
    this._listeners[eventName].push(listener)
  }
  return this
}

Nanobus.prototype.prependListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.prependListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.prependListener: listener should be type function')

  if (eventName === '*') {
    this._starListeners.unshift(listener)
  } else {
    if (!this._listeners[eventName]) this._listeners[eventName] = []
    this._listeners[eventName].unshift(listener)
  }
  return this
}

Nanobus.prototype.once = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.once: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.once: listener should be type function')

  var self = this
  this.on(eventName, once)
  function once () {
    listener.apply(self, arguments)
    self.removeListener(eventName, once)
  }
  return this
}

Nanobus.prototype.prependOnceListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.prependOnceListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.prependOnceListener: listener should be type function')

  var self = this
  this.prependListener(eventName, once)
  function once () {
    listener.apply(self, arguments)
    self.removeListener(eventName, once)
  }
  return this
}

Nanobus.prototype.removeListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.removeListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.removeListener: listener should be type function')

  if (eventName === '*') {
    this._starListeners = this._starListeners.slice()
    return remove(this._starListeners, listener)
  } else {
    if (typeof this._listeners[eventName] !== 'undefined') {
      this._listeners[eventName] = this._listeners[eventName].slice()
    }

    return remove(this._listeners[eventName], listener)
  }

  function remove (arr, listener) {
    if (!arr) return
    var index = arr.indexOf(listener)
    if (index !== -1) {
      arr.splice(index, 1)
      return true
    }
  }
}

Nanobus.prototype.removeAllListeners = function (eventName) {
  if (eventName) {
    if (eventName === '*') {
      this._starListeners = []
    } else {
      this._listeners[eventName] = []
    }
  } else {
    this._starListeners = []
    this._listeners = {}
  }
  return this
}

Nanobus.prototype.listeners = function (eventName) {
  var listeners = (eventName !== '*') ? this._listeners[eventName] : this._starListeners
  var ret = []
  if (listeners) {
    var ilength = listeners.length
    for (var i = 0; i < ilength; i++) ret.push(listeners[i])
  }
  return ret
}

Nanobus.prototype._emit = function (arr, eventName, data) {
  if (typeof arr === 'undefined') return
  if (!data) {
    data = eventName
    eventName = null
  }
  var length = arr.length
  for (var i = 0; i < length; i++) {
    var listener = arr[i]
    if (eventName) listener(eventName, data)
    else listener(data)
  }
}

},{"assert":2,"nanotiming":35}],27:[function(require,module,exports){
var assert = require('assert')

module.exports = history

// listen to html5 pushstate events
// and update router accordingly
function history (cb) {
  assert.equal(typeof cb, 'function', 'nanohistory: cb must be type function')
  window.onpopstate = function () {
    cb(document.location)
  }
}

},{"assert":2}],28:[function(require,module,exports){
var assert = require('assert')

module.exports = href

var noRoutingAttrName = 'data-no-routing'

// handle a click if is anchor tag with an href
// and url lives on the same domain. Replaces
// trailing '#' so empty links work as expected.
// (fn(str), obj?) -> undefined
function href (cb, root) {
  assert.equal(typeof cb, 'function', 'nanohref: cb must be type function')
  root = root || window.document

  window.onclick = function (e) {
    if ((e.button && e.button !== 0) || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return

    var node = (function traverse (node) {
      if (!node || node === root) return
      if (node.localName !== 'a') return traverse(node.parentNode)
      if (node.href === undefined) return traverse(node.parentNode)
      if (window.location.host !== node.host) return traverse(node.parentNode)
      return node
    })(e.target)

    if (!node) return

    var isRoutingDisabled = node.hasAttribute(noRoutingAttrName)
    if (isRoutingDisabled) return

    e.preventDefault()
    cb(node)
  }
}

},{"assert":2}],29:[function(require,module,exports){
var assert = require('assert')
var morph = require('./lib/morph')
var rootLabelRegex = /^data-onloadid/

var ELEMENT_NODE = 1

module.exports = nanomorph

// morph one tree into another tree
// (obj, obj) -> obj
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function nanomorph (oldTree, newTree) {
  assert.equal(typeof oldTree, 'object', 'nanomorph: oldTree should be an object')
  assert.equal(typeof newTree, 'object', 'nanomorph: newTree should be an object')

  persistStatefulRoot(newTree, oldTree)
  var tree = walk(newTree, oldTree)
  return tree
}

// walk and morph a dom tree
// (obj, obj) -> obj
function walk (newNode, oldNode) {
  if (!oldNode) {
    return newNode
  } else if (!newNode) {
    return null
  } else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
    return oldNode
  } else if (newNode.tagName !== oldNode.tagName) {
    return newNode
  } else {
    morph(newNode, oldNode)
    updateChildren(newNode, oldNode)
    return oldNode
  }
}

// update the children of elements
// (obj, obj) -> null
function updateChildren (newNode, oldNode) {
  if (!newNode.childNodes || !oldNode.childNodes) return

  var newLength = newNode.childNodes.length
  var oldLength = oldNode.childNodes.length
  var length = Math.max(oldLength, newLength)

  var iNew = 0
  var iOld = 0
  for (var i = 0; i < length; i++, iNew++, iOld++) {
    var newChildNode = newNode.childNodes[iNew]
    var oldChildNode = oldNode.childNodes[iOld]
    var retChildNode = walk(newChildNode, oldChildNode)
    if (!retChildNode) {
      if (oldChildNode) {
        oldNode.removeChild(oldChildNode)
        iOld--
      }
    } else if (!oldChildNode) {
      if (retChildNode) {
        oldNode.appendChild(retChildNode)
        iNew--
      }
    } else if (retChildNode !== oldChildNode) {
      oldNode.replaceChild(retChildNode, oldChildNode)
      iNew--
    }
  }
}

function persistStatefulRoot (newNode, oldNode) {
  if (!newNode || !oldNode || oldNode.nodeType !== ELEMENT_NODE || newNode.nodeType !== ELEMENT_NODE) return
  var oldAttrs = oldNode.attributes
  var attr, name
  for (var i = 0, len = oldAttrs.length; i < len; i++) {
    attr = oldAttrs[i]
    name = attr.name
    if (rootLabelRegex.test(name)) {
      newNode.setAttribute(name, attr.value)
      break
    }
  }
}

},{"./lib/morph":31,"assert":2}],30:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],31:[function(require,module,exports){
var events = require('./events')
var eventsLength = events.length

var ELEMENT_NODE = 1
var TEXT_NODE = 3
var COMMENT_NODE = 8

module.exports = morph

// diff elements and apply the resulting patch to the old node
// (obj, obj) -> null
function morph (newNode, oldNode) {
  var nodeType = newNode.nodeType
  var nodeName = newNode.nodeName

  if (nodeType === ELEMENT_NODE) {
    copyAttrs(newNode, oldNode)
  }

  if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
    oldNode.nodeValue = newNode.nodeValue
  }

  // Some DOM nodes are weird
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') updateInput(newNode, oldNode)
  else if (nodeName === 'OPTION') updateOption(newNode, oldNode)
  else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode)
  else if (nodeName === 'SELECT') updateSelect(newNode, oldNode)

  copyEvents(newNode, oldNode)
}

function copyAttrs (newNode, oldNode) {
  var oldAttrs = oldNode.attributes
  var newAttrs = newNode.attributes
  var attrNamespaceURI = null
  var attrValue = null
  var fromValue = null
  var attrName = null
  var attr = null

  for (var i = newAttrs.length - 1; i >= 0; --i) {
    attr = newAttrs[i]
    attrName = attr.name
    attrNamespaceURI = attr.namespaceURI
    attrValue = attr.value

    if (attrNamespaceURI) {
      attrName = attr.localName || attrName
      fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName)

      if (fromValue !== attrValue) {
        oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue)
      }
    } else {
      fromValue = oldNode.getAttribute(attrName)

      if (fromValue !== attrValue) {
        // apparently values are always cast to strings, ah well
        if (attrValue === 'null' || attrValue === 'undefined') {
          oldNode.removeAttribute(attrName)
        } else {
          oldNode.setAttribute(attrName, attrValue)
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j]
    if (attr.specified !== false) {
      attrName = attr.name
      attrNamespaceURI = attr.namespaceURI

      if (attrNamespaceURI) {
        attrName = attr.localName || attrName
        if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          oldNode.removeAttributeNS(attrNamespaceURI, attrName)
        }
      } else {
        if (!newNode.hasAttributeNS(null, attrName)) {
          oldNode.removeAttribute(attrName)
        }
      }
    }
  }
}

function copyEvents (newNode, oldNode) {
  for (var i = 0; i < eventsLength; i++) {
    var ev = events[i]
    if (newNode[ev]) {           // if new element has a whitelisted attribute
      oldNode[ev] = newNode[ev]  // update existing element
    } else if (oldNode[ev]) {    // if existing element has it and new one doesnt
      oldNode[ev] = undefined    // remove it from existing element
    }
  }
}

function updateOption (newNode, oldNode) {
  updateAttribute(newNode, oldNode, 'selected')
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput (newNode, oldNode) {
  var newValue = newNode.value
  var oldValue = oldNode.value

  updateAttribute(newNode, oldNode, 'checked')
  updateAttribute(newNode, oldNode, 'disabled')

  if (!newNode.hasAttributeNS(null, 'value') || newValue === 'null') {
    oldNode.value = ''
    oldNode.removeAttribute('value')
  } else if (newValue !== oldValue) {
    oldNode.setAttribute('value', newValue)
    oldNode.value = newValue
  } else if (oldNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    oldNode.value = newValue
  }
}

function updateTextarea (newNode, oldNode) {
  var newValue = newNode.value
  if (newValue !== oldNode.value) {
    oldNode.value = newValue
  }

  if (oldNode.firstChild) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
      return
    }

    oldNode.firstChild.nodeValue = newValue
  }
}

function updateSelect (newNode, oldNode) {
  if (!oldNode.hasAttributeNS(null, 'multiple')) {
    var i = 0
    var curChild = oldNode.firstChild
    while (curChild) {
      var nodeName = curChild.nodeName
      if (nodeName && nodeName.toUpperCase() === 'OPTION') {
        if (curChild.hasAttributeNS(null, 'selected')) break
        i++
      }
      curChild = curChild.nextSibling
    }

    newNode.selectedIndex = i
  }
}

function updateAttribute (newNode, oldNode, name) {
  if (newNode[name] !== oldNode[name]) {
    oldNode[name] = newNode[name]
    if (newNode[name]) {
      oldNode.setAttribute(name, '')
    } else {
      oldNode.removeAttribute(name, '')
    }
  }
}

},{"./events":30}],32:[function(require,module,exports){
var nanomorph = require('nanomorph')
var assert = require('assert')

module.exports = nanomount

function nanomount (target, newTree) {
  if (target.nodeName === 'BODY') {
    var children = target.childNodes
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName === 'SCRIPT') {
        newTree.appendChild(children[i].cloneNode(true))
      }
    }
  }

  var tree = nanomorph(target, newTree)
  assert.equal(tree, target, 'nanomount: The target node ' +
    tree.outerHTML.nodeName + ' is not the same type as the new node ' +
    target.outerHTML.nodeName + '.')
}

},{"assert":2,"nanomorph":29}],33:[function(require,module,exports){
'use strict'

var assert = require('assert')

module.exports = nanoraf

// Only call RAF when needed
// (fn, fn?) -> fn
function nanoraf (render, raf) {
  assert.equal(typeof render, 'function', 'nanoraf: render should be a function')
  assert.ok(typeof raf === 'function' || typeof raf === 'undefined', 'nanoraf: raf should be a function or undefined')

  if (!raf) raf = window.requestAnimationFrame
  var redrawScheduled = false
  var args = null

  return function frame () {
    if (args === null && !redrawScheduled) {
      redrawScheduled = true

      raf(function redraw () {
        redrawScheduled = false

        var length = args.length
        var _args = new Array(length)
        for (var i = 0; i < length; i++) _args[i] = args[i]

        render.apply(render, _args)
        args = null
      })
    }

    args = arguments
  }
}

},{"assert":25}],34:[function(require,module,exports){
var wayfarer = require('wayfarer')

var isLocalFile = (/file:\/\//.test(typeof window === 'object' &&
  window.location && window.location.origin)) // electron support

/* eslint-disable no-useless-escape */
var electron = '^(file:\/\/|\/)(.*\.html?\/?)?'
var protocol = '^(http(s)?(:\/\/))?(www\.)?'
var domain = '[a-zA-Z0-9-_\.]+(:[0-9]{1,5})?(\/{1})?'
var qs = '[\?].*$'
/* eslint-enable no-useless-escape */

var stripElectron = new RegExp(electron)
var prefix = new RegExp(protocol + domain)
var normalize = new RegExp('#')
var suffix = new RegExp(qs)

module.exports = Nanorouter

function Nanorouter (opts) {
  opts = opts || {}

  var router = wayfarer(opts.default || '/404')
  var curry = opts.curry || false
  var prevCallback = null
  var prevRoute = null

  emit.router = router
  emit.on = on
  emit.match = match
  return emit

  function on (routename, listener) {
    routename = routename.replace(/^[#/]/, '')
    router.on(routename, listener)
  }

  function emit (route) {
    if (!curry) {
      return router(route)
    } else {
      route = pathname(route, isLocalFile)
      if (route === prevRoute) {
        return prevCallback()
      } else {
        prevRoute = route
        prevCallback = router(route)
        return prevCallback()
      }
    }
  }

  function match (route) {
    route = pathname(route, isLocalFile)
    return router.match(route)
  }
}

// replace everything in a route but the pathname and hash
function pathname (route, isElectron) {
  if (isElectron) route = route.replace(stripElectron, '')
  else route = route.replace(prefix, '')
  return route.replace(suffix, '').replace(normalize, '/')
}

},{"wayfarer":49}],35:[function(require,module,exports){
var assert = require('assert')

module.exports = Nanotiming

function Nanotiming (name) {
  if (!(this instanceof Nanotiming)) return new Nanotiming(name)
  assert.equal(typeof name, 'string', 'Nanotiming: name should be type string')
  this._name = name
  this._enabled = typeof window !== 'undefined' &&
    window.performance && window.performance.mark
}

Nanotiming.prototype.start = function (partial) {
  if (!this._enabled) return
  var name = partial ? this._name + ':' + partial : this._name
  window.performance.mark(name + '-start')
}

Nanotiming.prototype.end = function (partial) {
  if (!this._enabled) return
  var name = partial ? this._name + ':' + partial : this._name
  window.performance.mark(name + '-end')
  window.performance.measure(name, name + '-start', name + '-end')
}

},{"assert":2}],36:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],37:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var assert = require('assert')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  if (document.body) {
    beginObserve(observer)
  } else {
    document.addEventListener('DOMContentLoaded', function (event) {
      beginObserve(observer)
    })
  }
}

function beginObserve (observer) {
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  assert(document.body, 'on-load: will not work prior to DOMContentLoaded')
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

module.exports.KEY_ATTR = KEY_ATTR
module.exports.KEY_ID = KEY_ID

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"assert":25,"global/document":15,"global/window":16}],38:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],39:[function(require,module,exports){
module.exports = function parseUnit(str, out) {
    if (!out)
        out = [ 0, '' ]

    str = String(str)
    var num = parseFloat(str, 10)
    out[0] = num
    out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
    return out
}
},{}],40:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],41:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],42:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],43:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":41,"./encode":42}],44:[function(require,module,exports){
var mouseChange = require('mouse-change')
var mouseWheel = require('mouse-wheel')
var identity = require('gl-mat4/identity')
var perspective = require('gl-mat4/perspective')
var lookAt = require('gl-mat4/lookAt')

module.exports = createCamera

var isBrowser = typeof window !== 'undefined'

function createCamera (regl, props_) {
  var props = props_ || {}
  var cameraState = {
    view: identity(new Float32Array(16)),
    projection: identity(new Float32Array(16)),
    center: new Float32Array(props.center || 3),
    theta: props.theta || 0,
    phi: props.phi || 0,
    distance: Math.log(props.distance || 10.0),
    eye: new Float32Array(3),
    up: new Float32Array(props.up || [0, 1, 0]),
    fovy: props.fovy || Math.PI / 4.0,
    near: typeof props.near !== 'undefined' ? props.near : 0.01,
    far: typeof props.far !== 'undefined' ? props.far : 1000.0,
    preventDefault: typeof props.preventDefault !== 'undefined' ? props.preventDefault : false,
    flipY: !!props.flipY,
    dtheta: 0,
    dphi: 0
  }

  var element = regl._gl.canvas
  element.addEventListener('mousewheel', function (e) {
    if (cameraState.preventDefault) e.preventDefault()
  })

  var damping = typeof props.damping !== 'undefined' ? props.damping : 0.9

  var right = new Float32Array([1, 0, 0])
  var front = new Float32Array([0, 0, 1])

  var minDistance = Math.log('minDistance' in props ? props.minDistance : 0.1)
  var maxDistance = Math.log('maxDistance' in props ? props.maxDistance : 1000)

  var ddistance = 0

  var prevX = 0
  var prevY = 0

  if (isBrowser && props.mouse !== false) {
    mouseChange(function (buttons, x, y) {
      if (buttons & 1) {
        var dx = (x - prevX) / window.innerWidth
        var dy = (y - prevY) / window.innerHeight
        var w = Math.max(cameraState.distance, 0.5)

        cameraState.dtheta += w * dx
        cameraState.dphi += w * dy
      }
      prevX = x
      prevY = y
    })
    mouseWheel(function (dx, dy) {
      ddistance += dy / window.innerHeight
    })
  }

  function damp (x) {
    var xd = x * damping
    if (Math.abs(xd) < 0.1) {
      return 0
    }
    return xd
  }

  function clamp (x, lo, hi) {
    return Math.min(Math.max(x, lo), hi)
  }

  function updateCamera (props) {
    Object.keys(props).forEach(function (prop) {
      cameraState[prop] = props[prop]
    })

    var center = cameraState.center
    var eye = cameraState.eye
    var up = cameraState.up
    var dtheta = cameraState.dtheta
    var dphi = cameraState.dphi

    cameraState.theta += dtheta
    cameraState.phi = clamp(
      cameraState.phi + dphi,
      -Math.PI / 2.0,
      Math.PI / 2.0)
    cameraState.distance = clamp(
      cameraState.distance + ddistance,
      minDistance,
      maxDistance)

    cameraState.dtheta = damp(dtheta)
    cameraState.dphi = damp(dphi)
    ddistance = damp(ddistance)

    var theta = cameraState.theta
    var phi = cameraState.phi
    var r = Math.exp(cameraState.distance)

    var vf = r * Math.sin(theta) * Math.cos(phi)
    var vr = r * Math.cos(theta) * Math.cos(phi)
    var vu = r * Math.sin(phi)

    for (var i = 0; i < 3; ++i) {
      eye[i] = center[i] + vf * front[i] + vr * right[i] + vu * up[i]
    }

    lookAt(cameraState.view, eye, center, up)
  }

  var injectContext = regl({
    context: Object.assign({}, cameraState, {
      projection: function (context) {
        perspective(cameraState.projection,
          cameraState.fovy,
          context.viewportWidth / context.viewportHeight,
          cameraState.near,
          cameraState.far)
        if (cameraState.flipY) { cameraState.projection[5] *= -1 }
        return cameraState.projection
      }
    }),
    uniforms: Object.keys(cameraState).reduce(function (uniforms, name) {
      uniforms[name] = regl.context(name)
      return uniforms
    }, {})
  })

  function setupCamera (props, block) {
    if (!block) {
      block = props
      props = {}
    }
    updateCamera(props)
    injectContext(block)
  }

  Object.keys(cameraState).forEach(function (name) {
    setupCamera[name] = cameraState[name]
  })

  return setupCamera
}

},{"gl-mat4/identity":12,"gl-mat4/lookAt":13,"gl-mat4/perspective":14,"mouse-change":22,"mouse-wheel":24}],45:[function(require,module,exports){
(function(aa,ia){"object"===typeof exports&&"undefined"!==typeof module?module.exports=ia():"function"===typeof define&&define.amd?define(ia):aa.createREGL=ia()})(this,function(){function aa(a,b){this.id=Ab++;this.type=a;this.data=b}function ia(a){if(0===a.length)return[];var b=a.charAt(0),c=a.charAt(a.length-1);if(1<a.length&&b===c&&('"'===b||"'"===b))return['"'+a.substr(1,a.length-2).replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'];if(b=/\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(a))return ia(a.substr(0,
b.index)).concat(ia(b[1])).concat(ia(a.substr(b.index+b[0].length)));b=a.split(".");if(1===b.length)return['"'+a.replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'];a=[];for(c=0;c<b.length;++c)a=a.concat(ia(b[c]));return a}function Za(a){return"["+ia(a).join("][")+"]"}function Bb(){var a={"":0},b=[""];return{id:function(c){var e=a[c];if(e)return e;e=a[c]=b.length;b.push(c);return e},str:function(a){return b[a]}}}function Cb(a,b,c){function e(){var b=window.innerWidth,e=window.innerHeight;a!==document.body&&
(e=a.getBoundingClientRect(),b=e.right-e.left,e=e.bottom-e.top);g.width=c*b;g.height=c*e;E(g.style,{width:b+"px",height:e+"px"})}var g=document.createElement("canvas");E(g.style,{border:0,margin:0,padding:0,top:0,left:0});a.appendChild(g);a===document.body&&(g.style.position="absolute",E(a.style,{margin:0,padding:0}));window.addEventListener("resize",e,!1);e();return{canvas:g,onDestroy:function(){window.removeEventListener("resize",e);a.removeChild(g)}}}function Db(a,b){function c(c){try{return a.getContext(c,
b)}catch(g){return null}}return c("webgl")||c("experimental-webgl")||c("webgl-experimental")}function $a(a){return"string"===typeof a?a.split():a}function ab(a){return"string"===typeof a?document.querySelector(a):a}function Eb(a){var b=a||{},c,e,g,d;a={};var p=[],f=[],r="undefined"===typeof window?1:window.devicePixelRatio,q=!1,t=function(a){},m=function(){};"string"===typeof b?c=document.querySelector(b):"object"===typeof b&&("string"===typeof b.nodeName&&"function"===typeof b.appendChild&&"function"===
typeof b.getBoundingClientRect?c=b:"function"===typeof b.drawArrays||"function"===typeof b.drawElements?(d=b,g=d.canvas):("gl"in b?d=b.gl:"canvas"in b?g=ab(b.canvas):"container"in b&&(e=ab(b.container)),"attributes"in b&&(a=b.attributes),"extensions"in b&&(p=$a(b.extensions)),"optionalExtensions"in b&&(f=$a(b.optionalExtensions)),"onDone"in b&&(t=b.onDone),"profile"in b&&(q=!!b.profile),"pixelRatio"in b&&(r=+b.pixelRatio)));c&&("canvas"===c.nodeName.toLowerCase()?g=c:e=c);if(!d){if(!g){c=Cb(e||document.body,
t,r);if(!c)return null;g=c.canvas;m=c.onDestroy}d=Db(g,a)}return d?{gl:d,canvas:g,container:e,extensions:p,optionalExtensions:f,pixelRatio:r,profile:q,onDone:t,onDestroy:m}:(m(),t("webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org"),null)}function Fb(a,b){function c(b){b=b.toLowerCase();var c;try{c=e[b]=a.getExtension(b)}catch(g){}return!!c}for(var e={},g=0;g<b.extensions.length;++g){var d=b.extensions[g];if(!c(d))return b.onDestroy(),b.onDone('"'+d+'" extension is not supported by the current WebGL context, try upgrading your system or a different browser'),
null}b.optionalExtensions.forEach(c);return{extensions:e,restore:function(){Object.keys(e).forEach(function(a){if(e[a]&&!c(a))throw Error("(regl): error restoring extension "+a);})}}}function J(a,b){for(var c=Array(a),e=0;e<a;++e)c[e]=b(e);return c}function bb(a){var b,c;b=(65535<a)<<4;a>>>=b;c=(255<a)<<3;a>>>=c;b|=c;c=(15<a)<<2;a>>>=c;b|=c;c=(3<a)<<1;return b|c|a>>>c>>1}function cb(){function a(a){a:{for(var b=16;268435456>=b;b*=16)if(a<=b){a=b;break a}a=0}b=c[bb(a)>>2];return 0<b.length?b.pop():
new ArrayBuffer(a)}function b(a){c[bb(a.byteLength)>>2].push(a)}var c=J(8,function(){return[]});return{alloc:a,free:b,allocType:function(b,c){var d=null;switch(b){case 5120:d=new Int8Array(a(c),0,c);break;case 5121:d=new Uint8Array(a(c),0,c);break;case 5122:d=new Int16Array(a(2*c),0,c);break;case 5123:d=new Uint16Array(a(2*c),0,c);break;case 5124:d=new Int32Array(a(4*c),0,c);break;case 5125:d=new Uint32Array(a(4*c),0,c);break;case 5126:d=new Float32Array(a(4*c),0,c);break;default:return null}return d.length!==
c?d.subarray(0,c):d},freeType:function(a){b(a.buffer)}}}function ma(a){return!!a&&"object"===typeof a&&Array.isArray(a.shape)&&Array.isArray(a.stride)&&"number"===typeof a.offset&&a.shape.length===a.stride.length&&(Array.isArray(a.data)||M(a.data))}function db(a,b,c,e,g,d){for(var p=0;p<b;++p)for(var f=a[p],r=0;r<c;++r)for(var q=f[r],t=0;t<e;++t)g[d++]=q[t]}function eb(a,b,c,e,g){for(var d=1,p=c+1;p<b.length;++p)d*=b[p];var f=b[c];if(4===b.length-c){var r=b[c+1],q=b[c+2];b=b[c+3];for(p=0;p<f;++p)db(a[p],
r,q,b,e,g),g+=d}else for(p=0;p<f;++p)eb(a[p],b,c+1,e,g),g+=d}function Ha(a){return Ia[Object.prototype.toString.call(a)]|0}function fb(a,b){for(var c=0;c<b.length;++c)a[c]=b[c]}function gb(a,b,c,e,g,d,p){for(var f=0,r=0;r<c;++r)for(var q=0;q<e;++q)a[f++]=b[g*r+d*q+p]}function Gb(a,b,c,e){function g(b){this.id=r++;this.buffer=a.createBuffer();this.type=b;this.usage=35044;this.byteLength=0;this.dimension=1;this.dtype=5121;this.persistentData=null;c.profile&&(this.stats={size:0})}function d(b,c,k){b.byteLength=
c.byteLength;a.bufferData(b.type,c,k)}function p(a,b,c,h,l,e){a.usage=c;if(Array.isArray(b)){if(a.dtype=h||5126,0<b.length)if(Array.isArray(b[0])){l=hb(b);for(var v=h=1;v<l.length;++v)h*=l[v];a.dimension=h;b=Qa(b,l,a.dtype);d(a,b,c);e?a.persistentData=b:x.freeType(b)}else"number"===typeof b[0]?(a.dimension=l,l=x.allocType(a.dtype,b.length),fb(l,b),d(a,l,c),e?a.persistentData=l:x.freeType(l)):M(b[0])&&(a.dimension=b[0].length,a.dtype=h||Ha(b[0])||5126,b=Qa(b,[b.length,b[0].length],a.dtype),d(a,b,c),
e?a.persistentData=b:x.freeType(b))}else if(M(b))a.dtype=h||Ha(b),a.dimension=l,d(a,b,c),e&&(a.persistentData=new Uint8Array(new Uint8Array(b.buffer)));else if(ma(b)){l=b.shape;var g=b.stride,v=b.offset,f=0,q=0,r=0,t=0;1===l.length?(f=l[0],q=1,r=g[0],t=0):2===l.length&&(f=l[0],q=l[1],r=g[0],t=g[1]);a.dtype=h||Ha(b.data)||5126;a.dimension=q;l=x.allocType(a.dtype,f*q);gb(l,b.data,f,q,r,t,v);d(a,l,c);e?a.persistentData=l:x.freeType(l)}else b instanceof ArrayBuffer&&(a.dtype=5121,a.dimension=l,d(a,b,
c),e&&(a.persistentData=new Uint8Array(new Uint8Array(b))))}function f(c){b.bufferCount--;for(var d=0;d<e.state.length;++d){var k=e.state[d];k.buffer===c&&(a.disableVertexAttribArray(d),k.buffer=null)}a.deleteBuffer(c.buffer);c.buffer=null;delete q[c.id]}var r=0,q={};g.prototype.bind=function(){a.bindBuffer(this.type,this.buffer)};g.prototype.destroy=function(){f(this)};var t=[];c.profile&&(b.getTotalBufferSize=function(){var a=0;Object.keys(q).forEach(function(b){a+=q[b].stats.size});return a});
return{create:function(m,e,d,h){function l(b){var m=35044,e=null,d=0,k=0,g=1;Array.isArray(b)||M(b)||ma(b)||b instanceof ArrayBuffer?e=b:"number"===typeof b?d=b|0:b&&("data"in b&&(e=b.data),"usage"in b&&(m=jb[b.usage]),"type"in b&&(k=Ra[b.type]),"dimension"in b&&(g=b.dimension|0),"length"in b&&(d=b.length|0));u.bind();e?p(u,e,m,k,g,h):(d&&a.bufferData(u.type,d,m),u.dtype=k||5121,u.usage=m,u.dimension=g,u.byteLength=d);c.profile&&(u.stats.size=u.byteLength*ja[u.dtype]);return l}b.bufferCount++;var u=
new g(e);q[u.id]=u;d||l(m);l._reglType="buffer";l._buffer=u;l.subdata=function(b,c){var m=(c||0)|0,e;u.bind();if(M(b)||b instanceof ArrayBuffer)a.bufferSubData(u.type,m,b);else if(Array.isArray(b)){if(0<b.length)if("number"===typeof b[0]){var d=x.allocType(u.dtype,b.length);fb(d,b);a.bufferSubData(u.type,m,d);x.freeType(d)}else if(Array.isArray(b[0])||M(b[0]))e=hb(b),d=Qa(b,e,u.dtype),a.bufferSubData(u.type,m,d),x.freeType(d)}else if(ma(b)){e=b.shape;var h=b.stride,k=d=0,g=0,F=0;1===e.length?(d=e[0],
k=1,g=h[0],F=0):2===e.length&&(d=e[0],k=e[1],g=h[0],F=h[1]);e=Array.isArray(b.data)?u.dtype:Ha(b.data);e=x.allocType(e,d*k);gb(e,b.data,d,k,g,F,b.offset);a.bufferSubData(u.type,m,e);x.freeType(e)}return l};c.profile&&(l.stats=u.stats);l.destroy=function(){f(u)};return l},createStream:function(a,b){var c=t.pop();c||(c=new g(a));c.bind();p(c,b,35040,0,1,!1);return c},destroyStream:function(a){t.push(a)},clear:function(){S(q).forEach(f);t.forEach(f)},getBuffer:function(a){return a&&a._buffer instanceof
g?a._buffer:null},restore:function(){S(q).forEach(function(b){b.buffer=a.createBuffer();a.bindBuffer(b.type,b.buffer);a.bufferData(b.type,b.persistentData||b.byteLength,b.usage)})},_initBuffer:p}}function Hb(a,b,c,e){function g(a){this.id=r++;f[this.id]=this;this.buffer=a;this.primType=4;this.type=this.vertCount=0}function d(e,d,g,h,l,u,v){e.buffer.bind();if(d){var f=v;v||M(d)&&(!ma(d)||M(d.data))||(f=b.oes_element_index_uint?5125:5123);c._initBuffer(e.buffer,d,g,f,3)}else a.bufferData(34963,u,g),
e.buffer.dtype=f||5121,e.buffer.usage=g,e.buffer.dimension=3,e.buffer.byteLength=u;f=v;if(!v){switch(e.buffer.dtype){case 5121:case 5120:f=5121;break;case 5123:case 5122:f=5123;break;case 5125:case 5124:f=5125}e.buffer.dtype=f}e.type=f;d=l;0>d&&(d=e.buffer.byteLength,5123===f?d>>=1:5125===f&&(d>>=2));e.vertCount=d;d=h;0>h&&(d=4,h=e.buffer.dimension,1===h&&(d=0),2===h&&(d=1),3===h&&(d=4));e.primType=d}function p(a){e.elementsCount--;delete f[a.id];a.buffer.destroy();a.buffer=null}var f={},r=0,q={uint8:5121,
uint16:5123};b.oes_element_index_uint&&(q.uint32=5125);g.prototype.bind=function(){this.buffer.bind()};var t=[];return{create:function(a,b){function k(a){if(a)if("number"===typeof a)h(a),l.primType=4,l.vertCount=a|0,l.type=5121;else{var b=null,c=35044,e=-1,g=-1,f=0,m=0;if(Array.isArray(a)||M(a)||ma(a))b=a;else if("data"in a&&(b=a.data),"usage"in a&&(c=jb[a.usage]),"primitive"in a&&(e=Sa[a.primitive]),"count"in a&&(g=a.count|0),"type"in a&&(m=q[a.type]),"length"in a)f=a.length|0;else if(f=g,5123===
m||5122===m)f*=2;else if(5125===m||5124===m)f*=4;d(l,b,c,e,g,f,m)}else h(),l.primType=4,l.vertCount=0,l.type=5121;return k}var h=c.create(null,34963,!0),l=new g(h._buffer);e.elementsCount++;k(a);k._reglType="elements";k._elements=l;k.subdata=function(a,b){h.subdata(a,b);return k};k.destroy=function(){p(l)};return k},createStream:function(a){var b=t.pop();b||(b=new g(c.create(null,34963,!0,!1)._buffer));d(b,a,35040,-1,-1,0,0);return b},destroyStream:function(a){t.push(a)},getElements:function(a){return"function"===
typeof a&&a._elements instanceof g?a._elements:null},clear:function(){S(f).forEach(p)}}}function kb(a){for(var b=x.allocType(5123,a.length),c=0;c<a.length;++c)if(isNaN(a[c]))b[c]=65535;else if(Infinity===a[c])b[c]=31744;else if(-Infinity===a[c])b[c]=64512;else{lb[0]=a[c];var e=Ib[0],g=e>>>31<<15,d=(e<<1>>>24)-127,e=e>>13&1023;b[c]=-24>d?g:-14>d?g+(e+1024>>-14-d):15<d?g+31744:g+(d+15<<10)+e}return b}function pa(a){return Array.isArray(a)||M(a)}function Ea(a){return"[object "+a+"]"}function mb(a){return Array.isArray(a)&&
(0===a.length||"number"===typeof a[0])}function nb(a){return Array.isArray(a)&&0!==a.length&&pa(a[0])?!0:!1}function na(a){return Object.prototype.toString.call(a)}function Ta(a){if(!a)return!1;var b=na(a);return 0<=Jb.indexOf(b)?!0:mb(a)||nb(a)||ma(a)}function ob(a,b){36193===a.type?(a.data=kb(b),x.freeType(b)):a.data=b}function Ja(a,b,c,e,g,d){a="undefined"!==typeof z[a]?z[a]:L[a]*qa[b];d&&(a*=6);if(g){for(e=0;1<=c;)e+=a*c*c,c/=2;return e}return a*c*e}function Kb(a,b,c,e,g,d,p){function f(){this.format=
this.internalformat=6408;this.type=5121;this.flipY=this.premultiplyAlpha=this.compressed=!1;this.unpackAlignment=1;this.colorSpace=37444;this.channels=this.height=this.width=0}function r(a,b){a.internalformat=b.internalformat;a.format=b.format;a.type=b.type;a.compressed=b.compressed;a.premultiplyAlpha=b.premultiplyAlpha;a.flipY=b.flipY;a.unpackAlignment=b.unpackAlignment;a.colorSpace=b.colorSpace;a.width=b.width;a.height=b.height;a.channels=b.channels}function q(a,b){if("object"===typeof b&&b){"premultiplyAlpha"in
b&&(a.premultiplyAlpha=b.premultiplyAlpha);"flipY"in b&&(a.flipY=b.flipY);"alignment"in b&&(a.unpackAlignment=b.alignment);"colorSpace"in b&&(a.colorSpace=wa[b.colorSpace]);"type"in b&&(a.type=G[b.type]);var c=a.width,e=a.height,d=a.channels,h=!1;"shape"in b?(c=b.shape[0],e=b.shape[1],3===b.shape.length&&(d=b.shape[2],h=!0)):("radius"in b&&(c=e=b.radius),"width"in b&&(c=b.width),"height"in b&&(e=b.height),"channels"in b&&(d=b.channels,h=!0));a.width=c|0;a.height=e|0;a.channels=d|0;c=!1;"format"in
b&&(c=b.format,e=a.internalformat=U[c],a.format=Lb[e],c in G&&!("type"in b)&&(a.type=G[c]),c in W&&(a.compressed=!0),c=!0);!h&&c?a.channels=L[a.format]:h&&!c&&a.channels!==La[a.format]&&(a.format=a.internalformat=La[a.channels])}}function t(b){a.pixelStorei(37440,b.flipY);a.pixelStorei(37441,b.premultiplyAlpha);a.pixelStorei(37443,b.colorSpace);a.pixelStorei(3317,b.unpackAlignment)}function m(){f.call(this);this.yOffset=this.xOffset=0;this.data=null;this.needsFree=!1;this.element=null;this.needsCopy=
!1}function C(a,b){var c=null;Ta(b)?c=b:b&&(q(a,b),"x"in b&&(a.xOffset=b.x|0),"y"in b&&(a.yOffset=b.y|0),Ta(b.data)&&(c=b.data));if(b.copy){var e=g.viewportWidth,d=g.viewportHeight;a.width=a.width||e-a.xOffset;a.height=a.height||d-a.yOffset;a.needsCopy=!0}else if(!c)a.width=a.width||1,a.height=a.height||1,a.channels=a.channels||4;else if(M(c))a.channels=a.channels||4,a.data=c,"type"in b||5121!==a.type||(a.type=Ia[Object.prototype.toString.call(c)]|0);else if(mb(c)){a.channels=a.channels||4;e=c;d=
e.length;switch(a.type){case 5121:case 5123:case 5125:case 5126:d=x.allocType(a.type,d);d.set(e);a.data=d;break;case 36193:a.data=kb(e)}a.alignment=1;a.needsFree=!0}else if(ma(c)){e=c.data;Array.isArray(e)||5121!==a.type||(a.type=Ia[Object.prototype.toString.call(e)]|0);var d=c.shape,h=c.stride,f,l,n,w;3===d.length?(n=d[2],w=h[2]):w=n=1;f=d[0];l=d[1];d=h[0];h=h[1];a.alignment=1;a.width=f;a.height=l;a.channels=n;a.format=a.internalformat=La[n];a.needsFree=!0;f=w;c=c.offset;n=a.width;w=a.height;l=a.channels;
for(var y=x.allocType(36193===a.type?5126:a.type,n*w*l),I=0,fa=0;fa<w;++fa)for(var ga=0;ga<n;++ga)for(var xa=0;xa<l;++xa)y[I++]=e[d*ga+h*fa+f*xa+c];ob(a,y)}else if(na(c)===Ua||na(c)===pb)na(c)===Ua?a.element=c:a.element=c.canvas,a.width=a.element.width,a.height=a.element.height,a.channels=4;else if(na(c)===qb)a.element=c,a.width=c.width,a.height=c.height,a.channels=4;else if(na(c)===rb)a.element=c,a.width=c.naturalWidth,a.height=c.naturalHeight,a.channels=4;else if(na(c)===sb)a.element=c,a.width=
c.videoWidth,a.height=c.videoHeight,a.channels=4;else if(nb(c)){e=a.width||c[0].length;d=a.height||c.length;h=a.channels;h=pa(c[0][0])?h||c[0][0].length:h||1;f=Ma.shape(c);n=1;for(w=0;w<f.length;++w)n*=f[w];n=x.allocType(36193===a.type?5126:a.type,n);Ma.flatten(c,f,"",n);ob(a,n);a.alignment=1;a.width=e;a.height=d;a.channels=h;a.format=a.internalformat=La[h];a.needsFree=!0}}function k(b,c,d,h,f){var g=b.element,l=b.data,k=b.internalformat,n=b.format,w=b.type,y=b.width,I=b.height;t(b);g?a.texSubImage2D(c,
f,d,h,n,w,g):b.compressed?a.compressedTexSubImage2D(c,f,d,h,k,y,I,l):b.needsCopy?(e(),a.copyTexSubImage2D(c,f,d,h,b.xOffset,b.yOffset,y,I)):a.texSubImage2D(c,f,d,h,y,I,n,w,l)}function h(){return P.pop()||new m}function l(a){a.needsFree&&x.freeType(a.data);m.call(a);P.push(a)}function u(){f.call(this);this.genMipmaps=!1;this.mipmapHint=4352;this.mipmask=0;this.images=Array(16)}function v(a,b,c){var d=a.images[0]=h();a.mipmask=1;d.width=a.width=b;d.height=a.height=c;d.channels=a.channels=4}function N(a,
b){var c=null;if(Ta(b))c=a.images[0]=h(),r(c,a),C(c,b),a.mipmask=1;else if(q(a,b),Array.isArray(b.mipmap))for(var d=b.mipmap,e=0;e<d.length;++e)c=a.images[e]=h(),r(c,a),c.width>>=e,c.height>>=e,C(c,d[e]),a.mipmask|=1<<e;else c=a.images[0]=h(),r(c,a),C(c,b),a.mipmask=1;r(a,a.images[0])}function B(b,c){for(var d=b.images,h=0;h<d.length&&d[h];++h){var f=d[h],g=c,l=h,k=f.element,n=f.data,w=f.internalformat,y=f.format,I=f.type,fa=f.width,ga=f.height,xa=f.channels;t(f);k?a.texImage2D(g,l,y,y,I,k):f.compressed?
a.compressedTexImage2D(g,l,w,fa,ga,0,n):f.needsCopy?(e(),a.copyTexImage2D(g,l,y,f.xOffset,f.yOffset,fa,ga,0)):((f=!n)&&(n=x.zero.allocType(I,fa*ga*xa)),a.texImage2D(g,l,y,fa,ga,0,y,I,n),f&&n&&x.zero.freeType(n))}}function D(){var a=tb.pop()||new u;f.call(a);for(var b=a.mipmask=0;16>b;++b)a.images[b]=null;return a}function ib(a){for(var b=a.images,c=0;c<b.length;++c)b[c]&&l(b[c]),b[c]=null;tb.push(a)}function z(){this.magFilter=this.minFilter=9728;this.wrapT=this.wrapS=33071;this.anisotropic=1;this.genMipmaps=
!1;this.mipmapHint=4352}function O(a,b){"min"in b&&(a.minFilter=Va[b.min],0<=Mb.indexOf(a.minFilter)&&!("faces"in b)&&(a.genMipmaps=!0));"mag"in b&&(a.magFilter=V[b.mag]);var c=a.wrapS,d=a.wrapT;if("wrap"in b){var e=b.wrap;"string"===typeof e?c=d=K[e]:Array.isArray(e)&&(c=K[e[0]],d=K[e[1]])}else"wrapS"in b&&(c=K[b.wrapS]),"wrapT"in b&&(d=K[b.wrapT]);a.wrapS=c;a.wrapT=d;"anisotropic"in b&&(a.anisotropic=b.anisotropic);if("mipmap"in b){c=!1;switch(typeof b.mipmap){case "string":a.mipmapHint=ua[b.mipmap];
c=a.genMipmaps=!0;break;case "boolean":c=a.genMipmaps=b.mipmap;break;case "object":a.genMipmaps=!1,c=!0}!c||"min"in b||(a.minFilter=9984)}}function R(c,d){a.texParameteri(d,10241,c.minFilter);a.texParameteri(d,10240,c.magFilter);a.texParameteri(d,10242,c.wrapS);a.texParameteri(d,10243,c.wrapT);b.ext_texture_filter_anisotropic&&a.texParameteri(d,34046,c.anisotropic);c.genMipmaps&&(a.hint(33170,c.mipmapHint),a.generateMipmap(d))}function F(b){f.call(this);this.mipmask=0;this.internalformat=6408;this.id=
ya++;this.refCount=1;this.target=b;this.texture=a.createTexture();this.unit=-1;this.bindCount=0;this.texInfo=new z;p.profile&&(this.stats={size:0})}function T(b){a.activeTexture(33984);a.bindTexture(b.target,b.texture)}function Aa(){var b=ha[0];b?a.bindTexture(b.target,b.texture):a.bindTexture(3553,null)}function A(b){var c=b.texture,e=b.unit,h=b.target;0<=e&&(a.activeTexture(33984+e),a.bindTexture(h,null),ha[e]=null);a.deleteTexture(c);b.texture=null;b.params=null;b.pixels=null;b.refCount=0;delete X[b.id];
d.textureCount--}var ua={"don't care":4352,"dont care":4352,nice:4354,fast:4353},K={repeat:10497,clamp:33071,mirror:33648},V={nearest:9728,linear:9729},Va=E({mipmap:9987,"nearest mipmap nearest":9984,"linear mipmap nearest":9985,"nearest mipmap linear":9986,"linear mipmap linear":9987},V),wa={none:0,browser:37444},G={uint8:5121,rgba4:32819,rgb565:33635,"rgb5 a1":32820},U={alpha:6406,luminance:6409,"luminance alpha":6410,rgb:6407,rgba:6408,rgba4:32854,"rgb5 a1":32855,rgb565:36194},W={};b.ext_srgb&&
(U.srgb=35904,U.srgba=35906);b.oes_texture_float&&(G.float32=G["float"]=5126);b.oes_texture_half_float&&(G.float16=G["half float"]=36193);b.webgl_depth_texture&&(E(U,{depth:6402,"depth stencil":34041}),E(G,{uint16:5123,uint32:5125,"depth stencil":34042}));b.webgl_compressed_texture_s3tc&&E(W,{"rgb s3tc dxt1":33776,"rgba s3tc dxt1":33777,"rgba s3tc dxt3":33778,"rgba s3tc dxt5":33779});b.webgl_compressed_texture_atc&&E(W,{"rgb atc":35986,"rgba atc explicit alpha":35987,"rgba atc interpolated alpha":34798});
b.webgl_compressed_texture_pvrtc&&E(W,{"rgb pvrtc 4bppv1":35840,"rgb pvrtc 2bppv1":35841,"rgba pvrtc 4bppv1":35842,"rgba pvrtc 2bppv1":35843});b.webgl_compressed_texture_etc1&&(W["rgb etc1"]=36196);var Nb=Array.prototype.slice.call(a.getParameter(34467));Object.keys(W).forEach(function(a){var b=W[a];0<=Nb.indexOf(b)&&(U[a]=b)});var ca=Object.keys(U);c.textureFormats=ca;var J=[];Object.keys(U).forEach(function(a){J[U[a]]=a});var da=[];Object.keys(G).forEach(function(a){da[G[a]]=a});var oa=[];Object.keys(V).forEach(function(a){oa[V[a]]=
a});var za=[];Object.keys(Va).forEach(function(a){za[Va[a]]=a});var ka=[];Object.keys(K).forEach(function(a){ka[K[a]]=a});var Lb=ca.reduce(function(a,b){var c=U[b];6409===c||6406===c||6409===c||6410===c||6402===c||34041===c?a[c]=c:32855===c||0<=b.indexOf("rgba")?a[c]=6408:a[c]=6407;return a},{}),P=[],tb=[],ya=0,X={},ea=c.maxTextureUnits,ha=Array(ea).map(function(){return null});E(F.prototype,{bind:function(){this.bindCount+=1;var b=this.unit;if(0>b){for(var c=0;c<ea;++c){var e=ha[c];if(e){if(0<e.bindCount)continue;
e.unit=-1}ha[c]=this;b=c;break}p.profile&&d.maxTextureUnits<b+1&&(d.maxTextureUnits=b+1);this.unit=b;a.activeTexture(33984+b);a.bindTexture(this.target,this.texture)}return b},unbind:function(){--this.bindCount},decRef:function(){0>=--this.refCount&&A(this)}});p.profile&&(d.getTotalTextureSize=function(){var a=0;Object.keys(X).forEach(function(b){a+=X[b].stats.size});return a});return{create2D:function(b,c){function e(a,b){var c=f.texInfo;z.call(c);var d=D();"number"===typeof a?"number"===typeof b?
v(d,a|0,b|0):v(d,a|0,a|0):a?(O(c,a),N(d,a)):v(d,1,1);c.genMipmaps&&(d.mipmask=(d.width<<1)-1);f.mipmask=d.mipmask;r(f,d);f.internalformat=d.internalformat;e.width=d.width;e.height=d.height;T(f);B(d,3553);R(c,3553);Aa();ib(d);p.profile&&(f.stats.size=Ja(f.internalformat,f.type,d.width,d.height,c.genMipmaps,!1));e.format=J[f.internalformat];e.type=da[f.type];e.mag=oa[c.magFilter];e.min=za[c.minFilter];e.wrapS=ka[c.wrapS];e.wrapT=ka[c.wrapT];return e}var f=new F(3553);X[f.id]=f;d.textureCount++;e(b,
c);e.subimage=function(a,b,c,d){b|=0;c|=0;d|=0;var n=h();r(n,f);n.width=0;n.height=0;C(n,a);n.width=n.width||(f.width>>d)-b;n.height=n.height||(f.height>>d)-c;T(f);k(n,3553,b,c,d);Aa();l(n);return e};e.resize=function(b,c){var d=b|0,h=c|0||d;if(d===f.width&&h===f.height)return e;e.width=f.width=d;e.height=f.height=h;T(f);for(var n,w=f.channels,y=f.type,I=0;f.mipmask>>I;++I){var fa=d>>I,ga=h>>I;if(!fa||!ga)break;n=x.zero.allocType(y,fa*ga*w);a.texImage2D(3553,I,f.format,fa,ga,0,f.format,f.type,n);
n&&x.zero.freeType(n)}Aa();p.profile&&(f.stats.size=Ja(f.internalformat,f.type,d,h,!1,!1));return e};e._reglType="texture2d";e._texture=f;p.profile&&(e.stats=f.stats);e.destroy=function(){f.decRef()};return e},createCube:function(b,c,e,f,g,ua){function A(a,b,c,d,e,f){var H,Y=m.texInfo;z.call(Y);for(H=0;6>H;++H)n[H]=D();if("number"===typeof a||!a)for(a=a|0||1,H=0;6>H;++H)v(n[H],a,a);else if("object"===typeof a)if(b)N(n[0],a),N(n[1],b),N(n[2],c),N(n[3],d),N(n[4],e),N(n[5],f);else if(O(Y,a),q(m,a),"faces"in
a)for(a=a.faces,H=0;6>H;++H)r(n[H],m),N(n[H],a[H]);else for(H=0;6>H;++H)N(n[H],a);r(m,n[0]);m.mipmask=Y.genMipmaps?(n[0].width<<1)-1:n[0].mipmask;m.internalformat=n[0].internalformat;A.width=n[0].width;A.height=n[0].height;T(m);for(H=0;6>H;++H)B(n[H],34069+H);R(Y,34067);Aa();p.profile&&(m.stats.size=Ja(m.internalformat,m.type,A.width,A.height,Y.genMipmaps,!0));A.format=J[m.internalformat];A.type=da[m.type];A.mag=oa[Y.magFilter];A.min=za[Y.minFilter];A.wrapS=ka[Y.wrapS];A.wrapT=ka[Y.wrapT];for(H=0;6>
H;++H)ib(n[H]);return A}var m=new F(34067);X[m.id]=m;d.cubeCount++;var n=Array(6);A(b,c,e,f,g,ua);A.subimage=function(a,b,c,n,d){c|=0;n|=0;d|=0;var e=h();r(e,m);e.width=0;e.height=0;C(e,b);e.width=e.width||(m.width>>d)-c;e.height=e.height||(m.height>>d)-n;T(m);k(e,34069+a,c,n,d);Aa();l(e);return A};A.resize=function(b){b|=0;if(b!==m.width){A.width=m.width=b;A.height=m.height=b;T(m);for(var c=0;6>c;++c)for(var n=0;m.mipmask>>n;++n)a.texImage2D(34069+c,n,m.format,b>>n,b>>n,0,m.format,m.type,null);Aa();
p.profile&&(m.stats.size=Ja(m.internalformat,m.type,A.width,A.height,!1,!0));return A}};A._reglType="textureCube";A._texture=m;p.profile&&(A.stats=m.stats);A.destroy=function(){m.decRef()};return A},clear:function(){for(var b=0;b<ea;++b)a.activeTexture(33984+b),a.bindTexture(3553,null),ha[b]=null;S(X).forEach(A);d.cubeCount=0;d.textureCount=0},getTexture:function(a){return null},restore:function(){for(var b=0;b<ea;++b){var c=ha[b];c&&(c.bindCount=0,c.unit=-1,ha[b]=null)}S(X).forEach(function(b){b.texture=
a.createTexture();a.bindTexture(b.target,b.texture);for(var c=0;32>c;++c)if(0!==(b.mipmask&1<<c))if(3553===b.target)a.texImage2D(3553,c,b.internalformat,b.width>>c,b.height>>c,0,b.internalformat,b.type,null);else for(var d=0;6>d;++d)a.texImage2D(34069+d,c,b.internalformat,b.width>>c,b.height>>c,0,b.internalformat,b.type,null);R(b.texInfo,b.target)})}}}function Ob(a,b,c,e,g,d){function p(a,b,c){this.target=a;this.texture=b;this.renderbuffer=c;var d=a=0;b?(a=b.width,d=b.height):c&&(a=c.width,d=c.height);
this.width=a;this.height=d}function f(a){a&&(a.texture&&a.texture._texture.decRef(),a.renderbuffer&&a.renderbuffer._renderbuffer.decRef())}function r(a,b,c){a&&(a.texture?a.texture._texture.refCount+=1:a.renderbuffer._renderbuffer.refCount+=1)}function q(b,c){c&&(c.texture?a.framebufferTexture2D(36160,b,c.target,c.texture._texture.texture,0):a.framebufferRenderbuffer(36160,b,36161,c.renderbuffer._renderbuffer.renderbuffer))}function t(a){var b=3553,c=null,d=null,e=a;"object"===typeof a&&(e=a.data,
"target"in a&&(b=a.target|0));a=e._reglType;"texture2d"===a?c=e:"textureCube"===a?c=e:"renderbuffer"===a&&(d=e,b=36161);return new p(b,c,d)}function m(a,b,c,d,f){if(c)return a=e.create2D({width:a,height:b,format:d,type:f}),a._texture.refCount=0,new p(3553,a,null);a=g.create({width:a,height:b,format:d});a._renderbuffer.refCount=0;return new p(36161,null,a)}function C(a){return a&&(a.texture||a.renderbuffer)}function k(a,b,c){a&&(a.texture?a.texture.resize(b,c):a.renderbuffer&&a.renderbuffer.resize(b,
c),a.width=b,a.height=c)}function h(){this.id=O++;R[this.id]=this;this.framebuffer=a.createFramebuffer();this.height=this.width=0;this.colorAttachments=[];this.depthStencilAttachment=this.stencilAttachment=this.depthAttachment=null}function l(a){a.colorAttachments.forEach(f);f(a.depthAttachment);f(a.stencilAttachment);f(a.depthStencilAttachment)}function u(b){a.deleteFramebuffer(b.framebuffer);b.framebuffer=null;d.framebufferCount--;delete R[b.id]}function v(b){var d;a.bindFramebuffer(36160,b.framebuffer);
var e=b.colorAttachments;for(d=0;d<e.length;++d)q(36064+d,e[d]);for(d=e.length;d<c.maxColorAttachments;++d)a.framebufferTexture2D(36160,36064+d,3553,null,0);a.framebufferTexture2D(36160,33306,3553,null,0);a.framebufferTexture2D(36160,36096,3553,null,0);a.framebufferTexture2D(36160,36128,3553,null,0);q(36096,b.depthAttachment);q(36128,b.stencilAttachment);q(33306,b.depthStencilAttachment);a.checkFramebufferStatus(36160);a.isContextLost();a.bindFramebuffer(36160,B.next?B.next.framebuffer:null);B.cur=
B.next;a.getError()}function N(a,b){function c(a,b){var d,f=0,h=0,g=!0,k=!0;d=null;var q=!0,u="rgba",p="uint8",N=1,da=null,oa=null,B=null,ka=!1;if("number"===typeof a)f=a|0,h=b|0||f;else if(a){"shape"in a?(h=a.shape,f=h[0],h=h[1]):("radius"in a&&(f=h=a.radius),"width"in a&&(f=a.width),"height"in a&&(h=a.height));if("color"in a||"colors"in a)d=a.color||a.colors,Array.isArray(d);if(!d){"colorCount"in a&&(N=a.colorCount|0);"colorTexture"in a&&(q=!!a.colorTexture,u="rgba4");if("colorType"in a&&(p=a.colorType,
!q))if("half float"===p||"float16"===p)u="rgba16f";else if("float"===p||"float32"===p)u="rgba32f";"colorFormat"in a&&(u=a.colorFormat,0<=x.indexOf(u)?q=!0:0<=D.indexOf(u)&&(q=!1))}if("depthTexture"in a||"depthStencilTexture"in a)ka=!(!a.depthTexture&&!a.depthStencilTexture);"depth"in a&&("boolean"===typeof a.depth?g=a.depth:(da=a.depth,k=!1));"stencil"in a&&("boolean"===typeof a.stencil?k=a.stencil:(oa=a.stencil,g=!1));"depthStencil"in a&&("boolean"===typeof a.depthStencil?g=k=a.depthStencil:(B=a.depthStencil,
k=g=!1))}else f=h=1;var F=null,z=null,E=null,T=null;if(Array.isArray(d))F=d.map(t);else if(d)F=[t(d)];else for(F=Array(N),d=0;d<N;++d)F[d]=m(f,h,q,u,p);f=f||F[0].width;h=h||F[0].height;da?z=t(da):g&&!k&&(z=m(f,h,ka,"depth","uint32"));oa?E=t(oa):k&&!g&&(E=m(f,h,!1,"stencil","uint8"));B?T=t(B):!da&&!oa&&k&&g&&(T=m(f,h,ka,"depth stencil","depth stencil"));g=null;for(d=0;d<F.length;++d)r(F[d],f,h),F[d]&&F[d].texture&&(k=Wa[F[d].texture._texture.format]*Na[F[d].texture._texture.type],null===g&&(g=k));
r(z,f,h);r(E,f,h);r(T,f,h);l(e);e.width=f;e.height=h;e.colorAttachments=F;e.depthAttachment=z;e.stencilAttachment=E;e.depthStencilAttachment=T;c.color=F.map(C);c.depth=C(z);c.stencil=C(E);c.depthStencil=C(T);c.width=e.width;c.height=e.height;v(e);return c}var e=new h;d.framebufferCount++;c(a,b);return E(c,{resize:function(a,b){var d=Math.max(a|0,1),f=Math.max(b|0||d,1);if(d===e.width&&f===e.height)return c;for(var h=e.colorAttachments,g=0;g<h.length;++g)k(h[g],d,f);k(e.depthAttachment,d,f);k(e.stencilAttachment,
d,f);k(e.depthStencilAttachment,d,f);e.width=c.width=d;e.height=c.height=f;v(e);return c},_reglType:"framebuffer",_framebuffer:e,destroy:function(){u(e);l(e)},use:function(a){B.setFBO({framebuffer:c},a)}})}var B={cur:null,next:null,dirty:!1,setFBO:null},x=["rgba"],D=["rgba4","rgb565","rgb5 a1"];b.ext_srgb&&D.push("srgba");b.ext_color_buffer_half_float&&D.push("rgba16f","rgb16f");b.webgl_color_buffer_float&&D.push("rgba32f");var z=["uint8"];b.oes_texture_half_float&&z.push("half float","float16");
b.oes_texture_float&&z.push("float","float32");var O=0,R={};return E(B,{getFramebuffer:function(a){return"function"===typeof a&&"framebuffer"===a._reglType&&(a=a._framebuffer,a instanceof h)?a:null},create:N,createCube:function(a){function b(a){var d,f={color:null},h=0,g=null;d="rgba";var l="uint8",m=1;if("number"===typeof a)h=a|0;else if(a){"shape"in a?h=a.shape[0]:("radius"in a&&(h=a.radius|0),"width"in a?h=a.width|0:"height"in a&&(h=a.height|0));if("color"in a||"colors"in a)g=a.color||a.colors,
Array.isArray(g);g||("colorCount"in a&&(m=a.colorCount|0),"colorType"in a&&(l=a.colorType),"colorFormat"in a&&(d=a.colorFormat));"depth"in a&&(f.depth=a.depth);"stencil"in a&&(f.stencil=a.stencil);"depthStencil"in a&&(f.depthStencil=a.depthStencil)}else h=1;if(g)if(Array.isArray(g))for(a=[],d=0;d<g.length;++d)a[d]=g[d];else a=[g];else for(a=Array(m),g={radius:h,format:d,type:l},d=0;d<m;++d)a[d]=e.createCube(g);f.color=Array(a.length);for(d=0;d<a.length;++d)m=a[d],h=h||m.width,f.color[d]={target:34069,
data:a[d]};for(d=0;6>d;++d){for(m=0;m<a.length;++m)f.color[m].target=34069+d;0<d&&(f.depth=c[0].depth,f.stencil=c[0].stencil,f.depthStencil=c[0].depthStencil);if(c[d])c[d](f);else c[d]=N(f)}return E(b,{width:h,height:h,color:a})}var c=Array(6);b(a);return E(b,{faces:c,resize:function(a){var d=a|0;if(d===b.width)return b;var e=b.color;for(a=0;a<e.length;++a)e[a].resize(d);for(a=0;6>a;++a)c[a].resize(d);b.width=b.height=d;return b},_reglType:"framebufferCube",destroy:function(){c.forEach(function(a){a.destroy()})}})},
clear:function(){S(R).forEach(u)},restore:function(){B.cur=null;B.next=null;B.dirty=!0;S(R).forEach(function(b){b.framebuffer=a.createFramebuffer();v(b)})}})}function ub(){this.w=this.z=this.y=this.x=this.state=0;this.buffer=null;this.size=0;this.normalized=!1;this.type=5126;this.divisor=this.stride=this.offset=0}function Pb(a,b,c,e){a=c.maxAttributes;b=Array(a);for(c=0;c<a;++c)b[c]=new ub;return{Record:ub,scope:{},state:b}}function Qb(a,b,c,e){function g(a,b,c,d){this.name=a;this.id=b;this.location=
c;this.info=d}function d(a,b){for(var c=0;c<a.length;++c)if(a[c].id===b.id){a[c].location=b.location;return}a.push(b)}function p(c,d,e){e=35632===c?q:t;var f=e[d];if(!f){var g=b.str(d),f=a.createShader(c);a.shaderSource(f,g);a.compileShader(f);e[d]=f}return f}function f(a,b){this.id=k++;this.fragId=a;this.vertId=b;this.program=null;this.uniforms=[];this.attributes=[];e.profile&&(this.stats={uniformsCount:0,attributesCount:0})}function r(c,f){var m,k;m=p(35632,c.fragId);k=p(35633,c.vertId);var q=c.program=
a.createProgram();a.attachShader(q,m);a.attachShader(q,k);a.linkProgram(q);var r=a.getProgramParameter(q,35718);e.profile&&(c.stats.uniformsCount=r);var t=c.uniforms;for(m=0;m<r;++m)if(k=a.getActiveUniform(q,m))if(1<k.size)for(var C=0;C<k.size;++C){var z=k.name.replace("[0]","["+C+"]");d(t,new g(z,b.id(z),a.getUniformLocation(q,z),k))}else d(t,new g(k.name,b.id(k.name),a.getUniformLocation(q,k.name),k));r=a.getProgramParameter(q,35721);e.profile&&(c.stats.attributesCount=r);t=c.attributes;for(m=0;m<
r;++m)(k=a.getActiveAttrib(q,m))&&d(t,new g(k.name,b.id(k.name),a.getAttribLocation(q,k.name),k))}var q={},t={},m={},C=[],k=0;e.profile&&(c.getMaxUniformsCount=function(){var a=0;C.forEach(function(b){b.stats.uniformsCount>a&&(a=b.stats.uniformsCount)});return a},c.getMaxAttributesCount=function(){var a=0;C.forEach(function(b){b.stats.attributesCount>a&&(a=b.stats.attributesCount)});return a});return{clear:function(){var b=a.deleteShader.bind(a);S(q).forEach(b);q={};S(t).forEach(b);t={};C.forEach(function(b){a.deleteProgram(b.program)});
C.length=0;m={};c.shaderCount=0},program:function(a,b,d){var e=m[b];e||(e=m[b]={});var g=e[a];g||(g=new f(b,a),c.shaderCount++,r(g,d),e[a]=g,C.push(g));return g},restore:function(){q={};t={};for(var a=0;a<C.length;++a)r(C[a])},shader:p,frag:-1,vert:-1}}function Rb(a,b,c,e,g,d,p){function f(d){var f;f=null===b.next?5121:b.next.colorAttachments[0].texture._texture.type;var g=0,r=0,k=e.framebufferWidth,h=e.framebufferHeight,l=null;M(d)?l=d:d&&(g=d.x|0,r=d.y|0,k=(d.width||e.framebufferWidth-g)|0,h=(d.height||
e.framebufferHeight-r)|0,l=d.data||null);c();d=k*h*4;l||(5121===f?l=new Uint8Array(d):5126===f&&(l=l||new Float32Array(d)));a.pixelStorei(3333,4);a.readPixels(g,r,k,h,6408,f,l);return l}function r(a){var c;b.setFBO({framebuffer:a.framebuffer},function(){c=f(a)});return c}return function(a){return a&&"framebuffer"in a?r(a):f(a)}}function Ba(a){return Array.prototype.slice.call(a)}function Ca(a){return Ba(a).join("")}function Sb(){function a(){var a=[],b=[];return E(function(){a.push.apply(a,Ba(arguments))},
{def:function(){var d="v"+c++;b.push(d);0<arguments.length&&(a.push(d,"="),a.push.apply(a,Ba(arguments)),a.push(";"));return d},toString:function(){return Ca([0<b.length?"var "+b.join(",")+";":"",Ca(a)])}})}function b(){function b(a,e){d(a,e,"=",c.def(a,e),";")}var c=a(),d=a(),e=c.toString,g=d.toString;return E(function(){c.apply(c,Ba(arguments))},{def:c.def,entry:c,exit:d,save:b,set:function(a,d,e){b(a,d);c(a,d,"=",e,";")},toString:function(){return e()+g()}})}var c=0,e=[],g=[],d=a(),p={};return{global:d,
link:function(a){for(var b=0;b<g.length;++b)if(g[b]===a)return e[b];b="g"+c++;e.push(b);g.push(a);return b},block:a,proc:function(a,c){function d(){var a="a"+e.length;e.push(a);return a}var e=[];c=c||0;for(var g=0;g<c;++g)d();var g=b(),C=g.toString;return p[a]=E(g,{arg:d,toString:function(){return Ca(["function(",e.join(),"){",C(),"}"])}})},scope:b,cond:function(){var a=Ca(arguments),c=b(),d=b(),e=c.toString,g=d.toString;return E(c,{then:function(){c.apply(c,Ba(arguments));return this},"else":function(){d.apply(d,
Ba(arguments));return this},toString:function(){var b=g();b&&(b="else{"+b+"}");return Ca(["if(",a,"){",e(),"}",b])}})},compile:function(){var a=['"use strict";',d,"return {"];Object.keys(p).forEach(function(b){a.push('"',b,'":',p[b].toString(),",")});a.push("}");var b=Ca(a).replace(/;/g,";\n").replace(/}/g,"}\n").replace(/{/g,"{\n");return Function.apply(null,e.concat(b)).apply(null,g)}}}function Oa(a){return Array.isArray(a)||M(a)||ma(a)}function vb(a){return a.sort(function(a,c){return"viewport"===
a?-1:"viewport"===c?1:a<c?-1:1})}function Z(a,b,c,e){this.thisDep=a;this.contextDep=b;this.propDep=c;this.append=e}function va(a){return a&&!(a.thisDep||a.contextDep||a.propDep)}function D(a){return new Z(!1,!1,!1,a)}function P(a,b){var c=a.type;return 0===c?(c=a.data.length,new Z(!0,1<=c,2<=c,b)):4===c?(c=a.data,new Z(c.thisDep,c.contextDep,c.propDep,b)):new Z(3===c,2===c,1===c,b)}function Tb(a,b,c,e,g,d,p,f,r,q,t,m,C,k,h){function l(a){return a.replace(".","_")}function u(a,b,c){var d=l(a);Ka.push(a);
Fa[d]=ra[d]=!!c;sa[d]=b}function v(a,b,c){var d=l(a);Ka.push(a);Array.isArray(c)?(ra[d]=c.slice(),Fa[d]=c.slice()):ra[d]=Fa[d]=c;ta[d]=b}function N(){var a=Sb(),c=a.link,d=a.global;a.id=qa++;a.batchId="0";var e=c(na),f=a.shared={props:"a0"};Object.keys(na).forEach(function(a){f[a]=d.def(e,".",a)});var g=a.next={},xa=a.current={};Object.keys(ta).forEach(function(a){Array.isArray(ra[a])&&(g[a]=d.def(f.next,".",a),xa[a]=d.def(f.current,".",a))});var H=a.constants={};Object.keys(aa).forEach(function(a){H[a]=
d.def(JSON.stringify(aa[a]))});a.invoke=function(b,d){switch(d.type){case 0:var e=["this",f.context,f.props,a.batchId];return b.def(c(d.data),".call(",e.slice(0,Math.max(d.data.length+1,4)),")");case 1:return b.def(f.props,d.data);case 2:return b.def(f.context,d.data);case 3:return b.def("this",d.data);case 4:return d.data.append(a,b),d.data.ref}};a.attribCache={};var Y={};a.scopeAttrib=function(a){a=b.id(a);if(a in Y)return Y[a];var d=q.scope[a];d||(d=q.scope[a]=new ya);return Y[a]=c(d)};return a}
function B(a){var b=a["static"];a=a.dynamic;var c;if("profile"in b){var d=!!b.profile;c=D(function(a,b){return d});c.enable=d}else if("profile"in a){var e=a.profile;c=P(e,function(a,b){return a.invoke(b,e)})}return c}function z(a,b){var c=a["static"],d=a.dynamic;if("framebuffer"in c){var e=c.framebuffer;return e?(e=f.getFramebuffer(e),D(function(a,b){var c=a.link(e),d=a.shared;b.set(d.framebuffer,".next",c);d=d.context;b.set(d,".framebufferWidth",c+".width");b.set(d,".framebufferHeight",c+".height");
return c})):D(function(a,b){var c=a.shared;b.set(c.framebuffer,".next","null");c=c.context;b.set(c,".framebufferWidth",c+".drawingBufferWidth");b.set(c,".framebufferHeight",c+".drawingBufferHeight");return"null"})}if("framebuffer"in d){var g=d.framebuffer;return P(g,function(a,b){var c=a.invoke(b,g),d=a.shared,e=d.framebuffer,c=b.def(e,".getFramebuffer(",c,")");b.set(e,".next",c);d=d.context;b.set(d,".framebufferWidth",c+"?"+c+".width:"+d+".drawingBufferWidth");b.set(d,".framebufferHeight",c+"?"+
c+".height:"+d+".drawingBufferHeight");return c})}return null}function x(a,b,c){function d(a){if(a in e){var c=e[a];a=!0;var n=c.x|0,ba=c.y|0,g,h;"width"in c?g=c.width|0:a=!1;"height"in c?h=c.height|0:a=!1;return new Z(!a&&b&&b.thisDep,!a&&b&&b.contextDep,!a&&b&&b.propDep,function(a,b){var d=a.shared.context,e=g;"width"in c||(e=b.def(d,".","framebufferWidth","-",n));var f=h;"height"in c||(f=b.def(d,".","framebufferHeight","-",ba));return[n,ba,e,f]})}if(a in f){var y=f[a];a=P(y,function(a,b){var c=
a.invoke(b,y),d=a.shared.context,e=b.def(c,".x|0"),n=b.def(c,".y|0"),Y=b.def('"width" in ',c,"?",c,".width|0:","(",d,".","framebufferWidth","-",e,")"),c=b.def('"height" in ',c,"?",c,".height|0:","(",d,".","framebufferHeight","-",n,")");return[e,n,Y,c]});b&&(a.thisDep=a.thisDep||b.thisDep,a.contextDep=a.contextDep||b.contextDep,a.propDep=a.propDep||b.propDep);return a}return b?new Z(b.thisDep,b.contextDep,b.propDep,function(a,b){var c=a.shared.context;return[0,0,b.def(c,".","framebufferWidth"),b.def(c,
".","framebufferHeight")]}):null}var e=a["static"],f=a.dynamic;if(a=d("viewport")){var g=a;a=new Z(a.thisDep,a.contextDep,a.propDep,function(a,b){var c=g.append(a,b),d=a.shared.context;b.set(d,".viewportWidth",c[2]);b.set(d,".viewportHeight",c[3]);return c})}return{viewport:a,scissor_box:d("scissor.box")}}function E(a){function c(a){if(a in d){var n=b.id(d[a]);a=D(function(){return n});a.id=n;return a}if(a in e){var f=e[a];return P(f,function(a,b){var c=a.invoke(b,f);return b.def(a.shared.strings,
".id(",c,")")})}return null}var d=a["static"],e=a.dynamic,f=c("frag"),g=c("vert"),h=null;va(f)&&va(g)?(h=t.program(g.id,f.id),a=D(function(a,b){return a.link(h)})):a=new Z(f&&f.thisDep||g&&g.thisDep,f&&f.contextDep||g&&g.contextDep,f&&f.propDep||g&&g.propDep,function(a,b){var c=a.shared.shader,d;d=f?f.append(a,b):b.def(c,".","frag");var e;e=g?g.append(a,b):b.def(c,".","vert");return b.def(c+".program("+e+","+d+")")});return{frag:f,vert:g,progVar:a,program:h}}function O(a,b){function c(a,b){if(a in
e){var d=e[a]|0;return D(function(a,c){b&&(a.OFFSET=d);return d})}if(a in f){var n=f[a];return P(n,function(a,c){var d=a.invoke(c,n);b&&(a.OFFSET=d);return d})}return b&&g?D(function(a,b){a.OFFSET="0";return 0}):null}var e=a["static"],f=a.dynamic,g=function(){if("elements"in e){var a=e.elements;Oa(a)?a=d.getElements(d.create(a,!0)):a&&(a=d.getElements(a));var b=D(function(b,c){if(a){var d=b.link(a);return b.ELEMENTS=d}return b.ELEMENTS=null});b.value=a;return b}if("elements"in f){var c=f.elements;
return P(c,function(a,b){var d=a.shared,e=d.isBufferArgs,d=d.elements,n=a.invoke(b,c),f=b.def("null"),e=b.def(e,"(",n,")"),n=a.cond(e).then(f,"=",d,".createStream(",n,");")["else"](f,"=",d,".getElements(",n,");");b.entry(n);b.exit(a.cond(e).then(d,".destroyStream(",f,");"));return a.ELEMENTS=f})}return null}(),h=c("offset",!0);return{elements:g,primitive:function(){if("primitive"in e){var a=e.primitive;return D(function(b,c){return Sa[a]})}if("primitive"in f){var b=f.primitive;return P(b,function(a,
c){var d=a.constants.primTypes,e=a.invoke(c,b);return c.def(d,"[",e,"]")})}return g?va(g)?g.value?D(function(a,b){return b.def(a.ELEMENTS,".primType")}):D(function(){return 4}):new Z(g.thisDep,g.contextDep,g.propDep,function(a,b){var c=a.ELEMENTS;return b.def(c,"?",c,".primType:",4)}):null}(),count:function(){if("count"in e){var a=e.count|0;return D(function(){return a})}if("count"in f){var b=f.count;return P(b,function(a,c){return a.invoke(c,b)})}return g?va(g)?g?h?new Z(h.thisDep,h.contextDep,h.propDep,
function(a,b){return b.def(a.ELEMENTS,".vertCount-",a.OFFSET)}):D(function(a,b){return b.def(a.ELEMENTS,".vertCount")}):D(function(){return-1}):new Z(g.thisDep||h.thisDep,g.contextDep||h.contextDep,g.propDep||h.propDep,function(a,b){var c=a.ELEMENTS;return a.OFFSET?b.def(c,"?",c,".vertCount-",a.OFFSET,":-1"):b.def(c,"?",c,".vertCount:-1")}):null}(),instances:c("instances",!1),offset:h}}function R(a,b){var c=a["static"],d=a.dynamic,e={};Ka.forEach(function(a){function b(f,g){if(a in c){var w=f(c[a]);
e[n]=D(function(){return w})}else if(a in d){var h=d[a];e[n]=P(h,function(a,b){return g(a,b,a.invoke(b,h))})}}var n=l(a);switch(a){case "cull.enable":case "blend.enable":case "dither":case "stencil.enable":case "depth.enable":case "scissor.enable":case "polygonOffset.enable":case "sample.alpha":case "sample.enable":case "depth.mask":return b(function(a){return a},function(a,b,c){return c});case "depth.func":return b(function(a){return Xa[a]},function(a,b,c){return b.def(a.constants.compareFuncs,"[",
c,"]")});case "depth.range":return b(function(a){return a},function(a,b,c){a=b.def("+",c,"[0]");b=b.def("+",c,"[1]");return[a,b]});case "blend.func":return b(function(a){return[Ga["srcRGB"in a?a.srcRGB:a.src],Ga["dstRGB"in a?a.dstRGB:a.dst],Ga["srcAlpha"in a?a.srcAlpha:a.src],Ga["dstAlpha"in a?a.dstAlpha:a.dst]]},function(a,b,c){function d(a,e){return b.def('"',a,e,'" in ',c,"?",c,".",a,e,":",c,".",a)}a=a.constants.blendFuncs;var e=d("src","RGB"),n=d("dst","RGB"),e=b.def(a,"[",e,"]"),f=b.def(a,"[",
d("src","Alpha"),"]"),n=b.def(a,"[",n,"]");a=b.def(a,"[",d("dst","Alpha"),"]");return[e,n,f,a]});case "blend.equation":return b(function(a){if("string"===typeof a)return[X[a],X[a]];if("object"===typeof a)return[X[a.rgb],X[a.alpha]]},function(a,b,c){var d=a.constants.blendEquations,e=b.def(),n=b.def();a=a.cond("typeof ",c,'==="string"');a.then(e,"=",n,"=",d,"[",c,"];");a["else"](e,"=",d,"[",c,".rgb];",n,"=",d,"[",c,".alpha];");b(a);return[e,n]});case "blend.color":return b(function(a){return J(4,function(b){return+a[b]})},
function(a,b,c){return J(4,function(a){return b.def("+",c,"[",a,"]")})});case "stencil.mask":return b(function(a){return a|0},function(a,b,c){return b.def(c,"|0")});case "stencil.func":return b(function(a){return[Xa[a.cmp||"keep"],a.ref||0,"mask"in a?a.mask:-1]},function(a,b,c){a=b.def('"cmp" in ',c,"?",a.constants.compareFuncs,"[",c,".cmp]",":",7680);var d=b.def(c,".ref|0");b=b.def('"mask" in ',c,"?",c,".mask|0:-1");return[a,d,b]});case "stencil.opFront":case "stencil.opBack":return b(function(b){return["stencil.opBack"===
a?1029:1028,Pa[b.fail||"keep"],Pa[b.zfail||"keep"],Pa[b.zpass||"keep"]]},function(b,c,d){function e(a){return c.def('"',a,'" in ',d,"?",n,"[",d,".",a,"]:",7680)}var n=b.constants.stencilOps;return["stencil.opBack"===a?1029:1028,e("fail"),e("zfail"),e("zpass")]});case "polygonOffset.offset":return b(function(a){return[a.factor|0,a.units|0]},function(a,b,c){a=b.def(c,".factor|0");b=b.def(c,".units|0");return[a,b]});case "cull.face":return b(function(a){var b=0;"front"===a?b=1028:"back"===a&&(b=1029);
return b},function(a,b,c){return b.def(c,'==="front"?',1028,":",1029)});case "lineWidth":return b(function(a){return a},function(a,b,c){return c});case "frontFace":return b(function(a){return wb[a]},function(a,b,c){return b.def(c+'==="cw"?2304:2305')});case "colorMask":return b(function(a){return a.map(function(a){return!!a})},function(a,b,c){return J(4,function(a){return"!!"+c+"["+a+"]"})});case "sample.coverage":return b(function(a){return["value"in a?a.value:1,!!a.invert]},function(a,b,c){a=b.def('"value" in ',
c,"?+",c,".value:1");b=b.def("!!",c,".invert");return[a,b]})}});return e}function F(a,b){var c=a["static"],d=a.dynamic,e={};Object.keys(c).forEach(function(a){var b=c[a],d;if("number"===typeof b||"boolean"===typeof b)d=D(function(){return b});else if("function"===typeof b){var n=b._reglType;if("texture2d"===n||"textureCube"===n)d=D(function(a){return a.link(b)});else if("framebuffer"===n||"framebufferCube"===n)d=D(function(a){return a.link(b.color[0])})}else pa(b)&&(d=D(function(a){return a.global.def("[",
J(b.length,function(a){return b[a]}),"]")}));d.value=b;e[a]=d});Object.keys(d).forEach(function(a){var b=d[a];e[a]=P(b,function(a,c){return a.invoke(c,b)})});return e}function T(a,c){var d=a["static"],e=a.dynamic,f={};Object.keys(d).forEach(function(a){var c=d[a],e=b.id(a),n=new ya;if(Oa(c))n.state=1,n.buffer=g.getBuffer(g.create(c,34962,!1,!0)),n.type=0;else{var w=g.getBuffer(c);if(w)n.state=1,n.buffer=w,n.type=0;else if("constant"in c){var h=c.constant;n.buffer="null";n.state=2;"number"===typeof h?
n.x=h:Da.forEach(function(a,b){b<h.length&&(n[a]=h[b])})}else{var w=Oa(c.buffer)?g.getBuffer(g.create(c.buffer,34962,!1,!0)):g.getBuffer(c.buffer),k=c.offset|0,m=c.stride|0,I=c.size|0,l=!!c.normalized,p=0;"type"in c&&(p=Ra[c.type]);c=c.divisor|0;n.buffer=w;n.state=1;n.size=I;n.normalized=l;n.type=p||w.dtype;n.offset=k;n.stride=m;n.divisor=c}}f[a]=D(function(a,b){var c=a.attribCache;if(e in c)return c[e];var d={isStream:!1};Object.keys(n).forEach(function(a){d[a]=n[a]});n.buffer&&(d.buffer=a.link(n.buffer),
d.type=d.type||d.buffer+".dtype");return c[e]=d})});Object.keys(e).forEach(function(a){var b=e[a];f[a]=P(b,function(a,c){function d(a){c(w[a],"=",e,".",a,"|0;")}var e=a.invoke(c,b),n=a.shared,f=a.constants,g=n.isBufferArgs,n=n.buffer,w={isStream:c.def(!1)},h=new ya;h.state=1;Object.keys(h).forEach(function(a){w[a]=c.def(""+h[a])});var y=w.buffer,k=w.type;c("if(",g,"(",e,")){",w.isStream,"=true;",y,"=",n,".createStream(",34962,",",e,");",k,"=",y,".dtype;","}else{",y,"=",n,".getBuffer(",e,");","if(",
y,"){",k,"=",y,".dtype;",'}else if("constant" in ',e,"){",w.state,"=",2,";","if(typeof "+e+'.constant === "number"){',w[Da[0]],"=",e,".constant;",Da.slice(1).map(function(a){return w[a]}).join("="),"=0;","}else{",Da.map(function(a,b){return w[a]+"="+e+".constant.length>"+b+"?"+e+".constant["+b+"]:0;"}).join(""),"}}else{","if(",g,"(",e,".buffer)){",y,"=",n,".createStream(",34962,",",e,".buffer);","}else{",y,"=",n,".getBuffer(",e,".buffer);","}",k,'="type" in ',e,"?",f.glTypes,"[",e,".type]:",y,".dtype;",
w.normalized,"=!!",e,".normalized;");d("size");d("offset");d("stride");d("divisor");c("}}");c.exit("if(",w.isStream,"){",n,".destroyStream(",y,");","}");return w})});return f}function M(a){var b=a["static"],c=a.dynamic,d={};Object.keys(b).forEach(function(a){var c=b[a];d[a]=D(function(a,b){return"number"===typeof c||"boolean"===typeof c?""+c:a.link(c)})});Object.keys(c).forEach(function(a){var b=c[a];d[a]=P(b,function(a,c){return a.invoke(c,b)})});return d}function A(a,b,c,d,e){var f=z(a,e),g=x(a,
f,e),h=O(a,e),k=R(a,e),m=E(a,e),ba=g.viewport;ba&&(k.viewport=ba);ba=l("scissor.box");(g=g[ba])&&(k[ba]=g);g=0<Object.keys(k).length;f={framebuffer:f,draw:h,shader:m,state:k,dirty:g};f.profile=B(a,e);f.uniforms=F(c,e);f.attributes=T(b,e);f.context=M(d,e);return f}function ua(a,b,c){var d=a.shared.context,e=a.scope();Object.keys(c).forEach(function(f){b.save(d,"."+f);e(d,".",f,"=",c[f].append(a,b),";")});b(e)}function K(a,b,c,d){var e=a.shared,f=e.gl,g=e.framebuffer,h;ha&&(h=b.def(e.extensions,".webgl_draw_buffers"));
var k=a.constants,e=k.drawBuffer,k=k.backBuffer;a=c?c.append(a,b):b.def(g,".next");d||b("if(",a,"!==",g,".cur){");b("if(",a,"){",f,".bindFramebuffer(",36160,",",a,".framebuffer);");ha&&b(h,".drawBuffersWEBGL(",e,"[",a,".colorAttachments.length]);");b("}else{",f,".bindFramebuffer(",36160,",null);");ha&&b(h,".drawBuffersWEBGL(",k,");");b("}",g,".cur=",a,";");d||b("}")}function V(a,b,c){var d=a.shared,e=d.gl,f=a.current,g=a.next,h=d.current,k=d.next,m=a.cond(h,".dirty");Ka.forEach(function(b){b=l(b);
if(!(b in c.state)){var d,w;if(b in g){d=g[b];w=f[b];var I=J(ra[b].length,function(a){return m.def(d,"[",a,"]")});m(a.cond(I.map(function(a,b){return a+"!=="+w+"["+b+"]"}).join("||")).then(e,".",ta[b],"(",I,");",I.map(function(a,b){return w+"["+b+"]="+a}).join(";"),";"))}else d=m.def(k,".",b),I=a.cond(d,"!==",h,".",b),m(I),b in sa?I(a.cond(d).then(e,".enable(",sa[b],");")["else"](e,".disable(",sa[b],");"),h,".",b,"=",d,";"):I(e,".",ta[b],"(",d,");",h,".",b,"=",d,";")}});0===Object.keys(c.state).length&&
m(h,".dirty=false;");b(m)}function Q(a,b,c,d){var e=a.shared,f=a.current,g=e.current,h=e.gl;vb(Object.keys(c)).forEach(function(e){var k=c[e];if(!d||d(k)){var m=k.append(a,b);if(sa[e]){var l=sa[e];va(k)?m?b(h,".enable(",l,");"):b(h,".disable(",l,");"):b(a.cond(m).then(h,".enable(",l,");")["else"](h,".disable(",l,");"));b(g,".",e,"=",m,";")}else if(pa(m)){var p=f[e];b(h,".",ta[e],"(",m,");",m.map(function(a,b){return p+"["+b+"]="+a}).join(";"),";")}else b(h,".",ta[e],"(",m,");",g,".",e,"=",m,";")}})}
function wa(a,b){ea&&(a.instancing=b.def(a.shared.extensions,".angle_instanced_arrays"))}function G(a,b,c,d,e){function f(){return"undefined"===typeof performance?"Date.now()":"performance.now()"}function g(a){t=b.def();a(t,"=",f(),";");"string"===typeof e?a(ba,".count+=",e,";"):a(ba,".count++;");k&&(d?(r=b.def(),a(r,"=",q,".getNumPendingQueries();")):a(q,".beginQuery(",ba,");"))}function h(a){a(ba,".cpuTime+=",f(),"-",t,";");k&&(d?a(q,".pushScopeStats(",r,",",q,".getNumPendingQueries(),",ba,");"):
a(q,".endQuery();"))}function m(a){var c=b.def(p,".profile");b(p,".profile=",a,";");b.exit(p,".profile=",c,";")}var l=a.shared,ba=a.stats,p=l.current,q=l.timer;c=c.profile;var t,r;if(c){if(va(c)){c.enable?(g(b),h(b.exit),m("true")):m("false");return}c=c.append(a,b);m(c)}else c=b.def(p,".profile");l=a.block();g(l);b("if(",c,"){",l,"}");a=a.block();h(a);b.exit("if(",c,"){",a,"}")}function U(a,b,c,d,e){function f(a){switch(a){case 35664:case 35667:case 35671:return 2;case 35665:case 35668:case 35672:return 3;
case 35666:case 35669:case 35673:return 4;default:return 1}}function g(c,d,e){function f(){b("if(!",y,".buffer){",k,".enableVertexAttribArray(",l,");}");var c=e.type,g;g=e.size?b.def(e.size,"||",d):d;b("if(",y,".type!==",c,"||",y,".size!==",g,"||",q.map(function(a){return y+"."+a+"!=="+e[a]}).join("||"),"){",k,".bindBuffer(",34962,",",I,".buffer);",k,".vertexAttribPointer(",[l,g,c,e.normalized,e.stride,e.offset],");",y,".type=",c,";",y,".size=",g,";",q.map(function(a){return y+"."+a+"="+e[a]+";"}).join(""),
"}");ea&&(c=e.divisor,b("if(",y,".divisor!==",c,"){",a.instancing,".vertexAttribDivisorANGLE(",[l,c],");",y,".divisor=",c,";}"))}function m(){b("if(",y,".buffer){",k,".disableVertexAttribArray(",l,");",y,".buffer=null;","}if(",Da.map(function(a,b){return y+"."+a+"!=="+p[b]}).join("||"),"){",k,".vertexAttrib4f(",l,",",p,");",Da.map(function(a,b){return y+"."+a+"="+p[b]+";"}).join(""),"}")}var k=h.gl,l=b.def(c,".location"),y=b.def(h.attributes,"[",l,"]");c=e.state;var I=e.buffer,p=[e.x,e.y,e.z,e.w],
q=["buffer","normalized","offset","stride"];1===c?f():2===c?m():(b("if(",c,"===",1,"){"),f(),b("}else{"),m(),b("}"))}var h=a.shared;d.forEach(function(d){var h=d.name,k=c.attributes[h],m;if(k){if(!e(k))return;m=k.append(a,b)}else{if(!e(xb))return;var l=a.scopeAttrib(h);m={};Object.keys(new ya).forEach(function(a){m[a]=b.def(l,".",a)})}g(a.link(d),f(d.info.type),m)})}function W(a,c,d,e,f){for(var g=a.shared,h=g.gl,k,m=0;m<e.length;++m){var l=e[m],p=l.name,q=l.info.type,t=d.uniforms[p],l=a.link(l)+
".location",r;if(t){if(!f(t))continue;if(va(t)){p=t.value;if(35678===q||35680===q)q=a.link(p._texture||p.color[0]._texture),c(h,".uniform1i(",l,",",q+".bind());"),c.exit(q,".unbind();");else if(35674===q||35675===q||35676===q)p=a.global.def("new Float32Array(["+Array.prototype.slice.call(p)+"])"),t=2,35675===q?t=3:35676===q&&(t=4),c(h,".uniformMatrix",t,"fv(",l,",false,",p,");");else{switch(q){case 5126:k="1f";break;case 35664:k="2f";break;case 35665:k="3f";break;case 35666:k="4f";break;case 35670:k=
"1i";break;case 5124:k="1i";break;case 35671:k="2i";break;case 35667:k="2i";break;case 35672:k="3i";break;case 35668:k="3i";break;case 35673:k="4i";break;case 35669:k="4i"}c(h,".uniform",k,"(",l,",",pa(p)?Array.prototype.slice.call(p):p,");")}continue}else r=t.append(a,c)}else{if(!f(xb))continue;r=c.def(g.uniforms,"[",b.id(p),"]")}35678===q?c("if(",r,"&&",r,'._reglType==="framebuffer"){',r,"=",r,".color[0];","}"):35680===q&&c("if(",r,"&&",r,'._reglType==="framebufferCube"){',r,"=",r,".color[0];",
"}");p=1;switch(q){case 35678:case 35680:q=c.def(r,"._texture");c(h,".uniform1i(",l,",",q,".bind());");c.exit(q,".unbind();");continue;case 5124:case 35670:k="1i";break;case 35667:case 35671:k="2i";p=2;break;case 35668:case 35672:k="3i";p=3;break;case 35669:case 35673:k="4i";p=4;break;case 5126:k="1f";break;case 35664:k="2f";p=2;break;case 35665:k="3f";p=3;break;case 35666:k="4f";p=4;break;case 35674:k="Matrix2fv";break;case 35675:k="Matrix3fv";break;case 35676:k="Matrix4fv"}c(h,".uniform",k,"(",
l,",");if("M"===k.charAt(0)){var l=Math.pow(q-35674+2,2),v=a.global.def("new Float32Array(",l,")");c("false,(Array.isArray(",r,")||",r," instanceof Float32Array)?",r,":(",J(l,function(a){return v+"["+a+"]="+r+"["+a+"]"}),",",v,")")}else 1<p?c(J(p,function(a){return r+"["+a+"]"})):c(r);c(");")}}function S(a,b,c,d){function e(f){var g=l[f];return g?g.contextDep&&d.contextDynamic||g.propDep?g.append(a,c):g.append(a,b):b.def(m,".",f)}function f(){function a(){c(u,".drawElementsInstancedANGLE(",[q,t,C,
r+"<<(("+C+"-5121)>>1)",v],");")}function b(){c(u,".drawArraysInstancedANGLE(",[q,r,t,v],");")}p?da?a():(c("if(",p,"){"),a(),c("}else{"),b(),c("}")):b()}function g(){function a(){c(k+".drawElements("+[q,t,C,r+"<<(("+C+"-5121)>>1)"]+");")}function b(){c(k+".drawArrays("+[q,r,t]+");")}p?da?a():(c("if(",p,"){"),a(),c("}else{"),b(),c("}")):b()}var h=a.shared,k=h.gl,m=h.draw,l=d.draw,p=function(){var e=l.elements,f=b;if(e){if(e.contextDep&&d.contextDynamic||e.propDep)f=c;e=e.append(a,f)}else e=f.def(m,
".","elements");e&&f("if("+e+")"+k+".bindBuffer(34963,"+e+".buffer.buffer);");return e}(),q=e("primitive"),r=e("offset"),t=function(){var e=l.count,f=b;if(e){if(e.contextDep&&d.contextDynamic||e.propDep)f=c;e=e.append(a,f)}else e=f.def(m,".","count");return e}();if("number"===typeof t){if(0===t)return}else c("if(",t,"){"),c.exit("}");var v,u;ea&&(v=e("instances"),u=a.instancing);var C=p+".type",da=l.elements&&va(l.elements);ea&&("number"!==typeof v||0<=v)?"string"===typeof v?(c("if(",v,">0){"),f(),
c("}else if(",v,"<0){"),g(),c("}")):f():g()}function ca(a,b,c,d,e){b=N();e=b.proc("body",e);ea&&(b.instancing=e.def(b.shared.extensions,".angle_instanced_arrays"));a(b,e,c,d);return b.compile().body}function L(a,b,c,d){wa(a,b);U(a,b,c,d.attributes,function(){return!0});W(a,b,c,d.uniforms,function(){return!0});S(a,b,b,c)}function da(a,b){var c=a.proc("draw",1);wa(a,c);ua(a,c,b.context);K(a,c,b.framebuffer);V(a,c,b);Q(a,c,b.state);G(a,c,b,!1,!0);var d=b.shader.progVar.append(a,c);c(a.shared.gl,".useProgram(",
d,".program);");if(b.shader.program)L(a,c,b,b.shader.program);else{var e=a.global.def("{}"),f=c.def(d,".id"),g=c.def(e,"[",f,"]");c(a.cond(g).then(g,".call(this,a0);")["else"](g,"=",e,"[",f,"]=",a.link(function(c){return ca(L,a,b,c,1)}),"(",d,");",g,".call(this,a0);"))}0<Object.keys(b.state).length&&c(a.shared.current,".dirty=true;")}function oa(a,b,c,d){function e(){return!0}a.batchId="a1";wa(a,b);U(a,b,c,d.attributes,e);W(a,b,c,d.uniforms,e);S(a,b,b,c)}function za(a,b,c,d){function e(a){return a.contextDep&&
g||a.propDep}function f(a){return!e(a)}wa(a,b);var g=c.contextDep,h=b.def(),k=b.def();a.shared.props=k;a.batchId=h;var m=a.scope(),l=a.scope();b(m.entry,"for(",h,"=0;",h,"<","a1",";++",h,"){",k,"=","a0","[",h,"];",l,"}",m.exit);c.needsContext&&ua(a,l,c.context);c.needsFramebuffer&&K(a,l,c.framebuffer);Q(a,l,c.state,e);c.profile&&e(c.profile)&&G(a,l,c,!1,!0);d?(U(a,m,c,d.attributes,f),U(a,l,c,d.attributes,e),W(a,m,c,d.uniforms,f),W(a,l,c,d.uniforms,e),S(a,m,l,c)):(b=a.global.def("{}"),d=c.shader.progVar.append(a,
l),k=l.def(d,".id"),m=l.def(b,"[",k,"]"),l(a.shared.gl,".useProgram(",d,".program);","if(!",m,"){",m,"=",b,"[",k,"]=",a.link(function(b){return ca(oa,a,c,b,2)}),"(",d,");}",m,".call(this,a0[",h,"],",h,");"))}function ka(a,b){function c(a){return a.contextDep&&e||a.propDep}var d=a.proc("batch",2);a.batchId="0";wa(a,d);var e=!1,f=!0;Object.keys(b.context).forEach(function(a){e=e||b.context[a].propDep});e||(ua(a,d,b.context),f=!1);var g=b.framebuffer,h=!1;g?(g.propDep?e=h=!0:g.contextDep&&e&&(h=!0),
h||K(a,d,g)):K(a,d,null);b.state.viewport&&b.state.viewport.propDep&&(e=!0);V(a,d,b);Q(a,d,b.state,function(a){return!c(a)});b.profile&&c(b.profile)||G(a,d,b,!1,"a1");b.contextDep=e;b.needsContext=f;b.needsFramebuffer=h;f=b.shader.progVar;if(f.contextDep&&e||f.propDep)za(a,d,b,null);else if(f=f.append(a,d),d(a.shared.gl,".useProgram(",f,".program);"),b.shader.program)za(a,d,b,b.shader.program);else{var g=a.global.def("{}"),h=d.def(f,".id"),k=d.def(g,"[",h,"]");d(a.cond(k).then(k,".call(this,a0,a1);")["else"](k,
"=",g,"[",h,"]=",a.link(function(c){return ca(za,a,b,c,2)}),"(",f,");",k,".call(this,a0,a1);"))}0<Object.keys(b.state).length&&d(a.shared.current,".dirty=true;")}function ia(a,c){function d(b){var g=c.shader[b];g&&e.set(f.shader,"."+b,g.append(a,e))}var e=a.proc("scope",3);a.batchId="a2";var f=a.shared,g=f.current;ua(a,e,c.context);c.framebuffer&&c.framebuffer.append(a,e);vb(Object.keys(c.state)).forEach(function(b){var d=c.state[b].append(a,e);pa(d)?d.forEach(function(c,d){e.set(a.next[b],"["+d+
"]",c)}):e.set(f.next,"."+b,d)});G(a,e,c,!0,!0);["elements","offset","count","instances","primitive"].forEach(function(b){var d=c.draw[b];d&&e.set(f.draw,"."+b,""+d.append(a,e))});Object.keys(c.uniforms).forEach(function(d){e.set(f.uniforms,"["+b.id(d)+"]",c.uniforms[d].append(a,e))});Object.keys(c.attributes).forEach(function(b){var d=c.attributes[b].append(a,e),f=a.scopeAttrib(b);Object.keys(new ya).forEach(function(a){e.set(f,"."+a,d[a])})});d("vert");d("frag");0<Object.keys(c.state).length&&(e(g,
".dirty=true;"),e.exit(g,".dirty=true;"));e("a1(",a.shared.context,",a0,",a.batchId,");")}function ma(a){if("object"===typeof a&&!pa(a)){for(var b=Object.keys(a),c=0;c<b.length;++c)if(la.isDynamic(a[b[c]]))return!0;return!1}}function ja(a,b,c){function d(a,b){g.forEach(function(c){var d=e[c];la.isDynamic(d)&&(d=a.invoke(b,d),b(l,".",c,"=",d,";"))})}var e=b["static"][c];if(e&&ma(e)){var f=a.global,g=Object.keys(e),h=!1,k=!1,m=!1,l=a.global.def("{}");g.forEach(function(b){var c=e[b];if(la.isDynamic(c))"function"===
typeof c&&(c=e[b]=la.unbox(c)),b=P(c,null),h=h||b.thisDep,m=m||b.propDep,k=k||b.contextDep;else{f(l,".",b,"=");switch(typeof c){case "number":f(c);break;case "string":f('"',c,'"');break;case "object":Array.isArray(c)&&f("[",c.join(),"]");break;default:f(a.link(c))}f(";")}});b.dynamic[c]=new la.DynamicVariable(4,{thisDep:h,contextDep:k,propDep:m,ref:l,append:d});delete b["static"][c]}}var ya=q.Record,X={add:32774,subtract:32778,"reverse subtract":32779};c.ext_blend_minmax&&(X.min=32775,X.max=32776);
var ea=c.angle_instanced_arrays,ha=c.webgl_draw_buffers,ra={dirty:!0,profile:h.profile},Fa={},Ka=[],sa={},ta={};u("dither",3024);u("blend.enable",3042);v("blend.color","blendColor",[0,0,0,0]);v("blend.equation","blendEquationSeparate",[32774,32774]);v("blend.func","blendFuncSeparate",[1,0,1,0]);u("depth.enable",2929,!0);v("depth.func","depthFunc",513);v("depth.range","depthRange",[0,1]);v("depth.mask","depthMask",!0);v("colorMask","colorMask",[!0,!0,!0,!0]);u("cull.enable",2884);v("cull.face","cullFace",
1029);v("frontFace","frontFace",2305);v("lineWidth","lineWidth",1);u("polygonOffset.enable",32823);v("polygonOffset.offset","polygonOffset",[0,0]);u("sample.alpha",32926);u("sample.enable",32928);v("sample.coverage","sampleCoverage",[1,!1]);u("stencil.enable",2960);v("stencil.mask","stencilMask",-1);v("stencil.func","stencilFunc",[519,0,-1]);v("stencil.opFront","stencilOpSeparate",[1028,7680,7680,7680]);v("stencil.opBack","stencilOpSeparate",[1029,7680,7680,7680]);u("scissor.enable",3089);v("scissor.box",
"scissor",[0,0,a.drawingBufferWidth,a.drawingBufferHeight]);v("viewport","viewport",[0,0,a.drawingBufferWidth,a.drawingBufferHeight]);var na={gl:a,context:C,strings:b,next:Fa,current:ra,draw:m,elements:d,buffer:g,shader:t,attributes:q.state,uniforms:r,framebuffer:f,extensions:c,timer:k,isBufferArgs:Oa},aa={primTypes:Sa,compareFuncs:Xa,blendFuncs:Ga,blendEquations:X,stencilOps:Pa,glTypes:Ra,orientationType:wb};ha&&(aa.backBuffer=[1029],aa.drawBuffer=J(e.maxDrawbuffers,function(a){return 0===a?[0]:
J(a,function(a){return 36064+a})}));var qa=0;return{next:Fa,current:ra,procs:function(){var a=N(),b=a.proc("poll"),c=a.proc("refresh"),d=a.block();b(d);c(d);var f=a.shared,g=f.gl,h=f.next,k=f.current;d(k,".dirty=false;");K(a,b);K(a,c,null,!0);var m;ea&&(m=a.link(ea));for(var l=0;l<e.maxAttributes;++l){var p=c.def(f.attributes,"[",l,"]"),q=a.cond(p,".buffer");q.then(g,".enableVertexAttribArray(",l,");",g,".bindBuffer(",34962,",",p,".buffer.buffer);",g,".vertexAttribPointer(",l,",",p,".size,",p,".type,",
p,".normalized,",p,".stride,",p,".offset);")["else"](g,".disableVertexAttribArray(",l,");",g,".vertexAttrib4f(",l,",",p,".x,",p,".y,",p,".z,",p,".w);",p,".buffer=null;");c(q);ea&&c(m,".vertexAttribDivisorANGLE(",l,",",p,".divisor);")}Object.keys(sa).forEach(function(e){var f=sa[e],m=d.def(h,".",e),l=a.block();l("if(",m,"){",g,".enable(",f,")}else{",g,".disable(",f,")}",k,".",e,"=",m,";");c(l);b("if(",m,"!==",k,".",e,"){",l,"}")});Object.keys(ta).forEach(function(e){var f=ta[e],m=ra[e],l,p,q=a.block();
q(g,".",f,"(");pa(m)?(f=m.length,l=a.global.def(h,".",e),p=a.global.def(k,".",e),q(J(f,function(a){return l+"["+a+"]"}),");",J(f,function(a){return p+"["+a+"]="+l+"["+a+"];"}).join("")),b("if(",J(f,function(a){return l+"["+a+"]!=="+p+"["+a+"]"}).join("||"),"){",q,"}")):(l=d.def(h,".",e),p=d.def(k,".",e),q(l,");",k,".",e,"=",l,";"),b("if(",l,"!==",p,"){",q,"}"));c(q)});return a.compile()}(),compile:function(a,b,c,d,e){var f=N();f.stats=f.link(e);Object.keys(b["static"]).forEach(function(a){ja(f,b,
a)});Ub.forEach(function(b){ja(f,a,b)});c=A(a,b,c,d,f);da(f,c);ia(f,c);ka(f,c);return f.compile()}}}function yb(a,b){for(var c=0;c<a.length;++c)if(a[c]===b)return c;return-1}var E=function(a,b){for(var c=Object.keys(b),e=0;e<c.length;++e)a[c[e]]=b[c[e]];return a},Ab=0,la={DynamicVariable:aa,define:function(a,b){return new aa(a,Za(b+""))},isDynamic:function(a){return"function"===typeof a&&!a._reglType||a instanceof aa},unbox:function(a,b){return"function"===typeof a?new aa(0,a):a},accessor:Za},Ya=
{next:"function"===typeof requestAnimationFrame?function(a){return requestAnimationFrame(a)}:function(a){return setTimeout(a,16)},cancel:"function"===typeof cancelAnimationFrame?function(a){return cancelAnimationFrame(a)}:clearTimeout},zb="undefined"!==typeof performance&&performance.now?function(){return performance.now()}:function(){return+new Date},x=cb();x.zero=cb();var Vb=function(a,b){var c=1;b.ext_texture_filter_anisotropic&&(c=a.getParameter(34047));var e=1,g=1;b.webgl_draw_buffers&&(e=a.getParameter(34852),
g=a.getParameter(36063));var d=!!b.oes_texture_float;if(d){d=a.createTexture();a.bindTexture(3553,d);a.texImage2D(3553,0,6408,1,1,0,6408,5126,null);var p=a.createFramebuffer();a.bindFramebuffer(36160,p);a.framebufferTexture2D(36160,36064,3553,d,0);a.bindTexture(3553,null);if(36053!==a.checkFramebufferStatus(36160))d=!1;else{a.viewport(0,0,1,1);a.clearColor(1,0,0,1);a.clear(16384);var f=x.allocType(5126,4);a.readPixels(0,0,1,1,6408,5126,f);a.getError()?d=!1:(a.deleteFramebuffer(p),a.deleteTexture(d),
d=1===f[0]);x.freeType(f)}}f=!0;"undefined"!==typeof navigator&&(/MSIE/.test(navigator.userAgent)||/Trident\//.test(navigator.appVersion)||/Edge/.test(navigator.userAgent))||(f=a.createTexture(),p=x.allocType(5121,36),a.activeTexture(33984),a.bindTexture(34067,f),a.texImage2D(34069,0,6408,3,3,0,6408,5121,p),x.freeType(p),a.bindTexture(34067,null),a.deleteTexture(f),f=!a.getError());return{colorBits:[a.getParameter(3410),a.getParameter(3411),a.getParameter(3412),a.getParameter(3413)],depthBits:a.getParameter(3414),
stencilBits:a.getParameter(3415),subpixelBits:a.getParameter(3408),extensions:Object.keys(b).filter(function(a){return!!b[a]}),maxAnisotropic:c,maxDrawbuffers:e,maxColorAttachments:g,pointSizeDims:a.getParameter(33901),lineWidthDims:a.getParameter(33902),maxViewportDims:a.getParameter(3386),maxCombinedTextureUnits:a.getParameter(35661),maxCubeMapSize:a.getParameter(34076),maxRenderbufferSize:a.getParameter(34024),maxTextureUnits:a.getParameter(34930),maxTextureSize:a.getParameter(3379),maxAttributes:a.getParameter(34921),
maxVertexUniforms:a.getParameter(36347),maxVertexTextureUnits:a.getParameter(35660),maxVaryingVectors:a.getParameter(36348),maxFragmentUniforms:a.getParameter(36349),glsl:a.getParameter(35724),renderer:a.getParameter(7937),vendor:a.getParameter(7936),version:a.getParameter(7938),readFloat:d,npotTextureCube:f}},M=function(a){return a instanceof Uint8Array||a instanceof Uint16Array||a instanceof Uint32Array||a instanceof Int8Array||a instanceof Int16Array||a instanceof Int32Array||a instanceof Float32Array||
a instanceof Float64Array||a instanceof Uint8ClampedArray},S=function(a){return Object.keys(a).map(function(b){return a[b]})},Ma={shape:function(a){for(var b=[];a.length;a=a[0])b.push(a.length);return b},flatten:function(a,b,c,e){var g=1;if(b.length)for(var d=0;d<b.length;++d)g*=b[d];else g=0;c=e||x.allocType(c,g);switch(b.length){case 0:break;case 1:e=b[0];for(b=0;b<e;++b)c[b]=a[b];break;case 2:e=b[0];b=b[1];for(d=g=0;d<e;++d)for(var p=a[d],f=0;f<b;++f)c[g++]=p[f];break;case 3:db(a,b[0],b[1],b[2],
c,0);break;default:eb(a,b,0,c,0)}return c}},Ia={"[object Int8Array]":5120,"[object Int16Array]":5122,"[object Int32Array]":5124,"[object Uint8Array]":5121,"[object Uint8ClampedArray]":5121,"[object Uint16Array]":5123,"[object Uint32Array]":5125,"[object Float32Array]":5126,"[object Float64Array]":5121,"[object ArrayBuffer]":5121},Ra={int8:5120,int16:5122,int32:5124,uint8:5121,uint16:5123,uint32:5125,"float":5126,float32:5126},jb={dynamic:35048,stream:35040,"static":35044},Qa=Ma.flatten,hb=Ma.shape,
ja=[];ja[5120]=1;ja[5122]=2;ja[5124]=4;ja[5121]=1;ja[5123]=2;ja[5125]=4;ja[5126]=4;var Sa={points:0,point:0,lines:1,line:1,triangles:4,triangle:4,"line loop":2,"line strip":3,"triangle strip":5,"triangle fan":6},lb=new Float32Array(1),Ib=new Uint32Array(lb.buffer),Mb=[9984,9986,9985,9987],La=[0,6409,6410,6407,6408],L={};L[6409]=L[6406]=L[6402]=1;L[34041]=L[6410]=2;L[6407]=L[35904]=3;L[6408]=L[35906]=4;var Ua=Ea("HTMLCanvasElement"),pb=Ea("CanvasRenderingContext2D"),qb=Ea("ImageBitmap"),rb=Ea("HTMLImageElement"),
sb=Ea("HTMLVideoElement"),Jb=Object.keys(Ia).concat([Ua,pb,qb,rb,sb]),qa=[];qa[5121]=1;qa[5126]=4;qa[36193]=2;qa[5123]=2;qa[5125]=4;var z=[];z[32854]=2;z[32855]=2;z[36194]=2;z[34041]=4;z[33776]=.5;z[33777]=.5;z[33778]=1;z[33779]=1;z[35986]=.5;z[35987]=1;z[34798]=1;z[35840]=.5;z[35841]=.25;z[35842]=.5;z[35843]=.25;z[36196]=.5;var Q=[];Q[32854]=2;Q[32855]=2;Q[36194]=2;Q[33189]=2;Q[36168]=1;Q[34041]=4;Q[35907]=4;Q[34836]=16;Q[34842]=8;Q[34843]=6;var Wb=function(a,b,c,e,g){function d(a){this.id=q++;this.refCount=
1;this.renderbuffer=a;this.format=32854;this.height=this.width=0;g.profile&&(this.stats={size:0})}function p(b){var c=b.renderbuffer;a.bindRenderbuffer(36161,null);a.deleteRenderbuffer(c);b.renderbuffer=null;b.refCount=0;delete t[b.id];e.renderbufferCount--}var f={rgba4:32854,rgb565:36194,"rgb5 a1":32855,depth:33189,stencil:36168,"depth stencil":34041};b.ext_srgb&&(f.srgba=35907);b.ext_color_buffer_half_float&&(f.rgba16f=34842,f.rgb16f=34843);b.webgl_color_buffer_float&&(f.rgba32f=34836);var r=[];
Object.keys(f).forEach(function(a){r[f[a]]=a});var q=0,t={};d.prototype.decRef=function(){0>=--this.refCount&&p(this)};g.profile&&(e.getTotalRenderbufferSize=function(){var a=0;Object.keys(t).forEach(function(b){a+=t[b].stats.size});return a});return{create:function(b,c){function k(b,c){var d=0,e=0,m=32854;"object"===typeof b&&b?("shape"in b?(e=b.shape,d=e[0]|0,e=e[1]|0):("radius"in b&&(d=e=b.radius|0),"width"in b&&(d=b.width|0),"height"in b&&(e=b.height|0)),"format"in b&&(m=f[b.format])):"number"===
typeof b?(d=b|0,e="number"===typeof c?c|0:d):b||(d=e=1);if(d!==h.width||e!==h.height||m!==h.format)return k.width=h.width=d,k.height=h.height=e,h.format=m,a.bindRenderbuffer(36161,h.renderbuffer),a.renderbufferStorage(36161,m,d,e),g.profile&&(h.stats.size=Q[h.format]*h.width*h.height),k.format=r[h.format],k}var h=new d(a.createRenderbuffer());t[h.id]=h;e.renderbufferCount++;k(b,c);k.resize=function(b,c){var d=b|0,e=c|0||d;if(d===h.width&&e===h.height)return k;k.width=h.width=d;k.height=h.height=e;
a.bindRenderbuffer(36161,h.renderbuffer);a.renderbufferStorage(36161,h.format,d,e);g.profile&&(h.stats.size=Q[h.format]*h.width*h.height);return k};k._reglType="renderbuffer";k._renderbuffer=h;g.profile&&(k.stats=h.stats);k.destroy=function(){h.decRef()};return k},clear:function(){S(t).forEach(p)},restore:function(){S(t).forEach(function(b){b.renderbuffer=a.createRenderbuffer();a.bindRenderbuffer(36161,b.renderbuffer);a.renderbufferStorage(36161,b.format,b.width,b.height)});a.bindRenderbuffer(36161,
null)}}},Wa=[];Wa[6408]=4;Wa[6407]=3;var Na=[];Na[5121]=1;Na[5126]=4;Na[36193]=2;var Da=["x","y","z","w"],Ub="blend.func blend.equation stencil.func stencil.opFront stencil.opBack sample.coverage viewport scissor.box polygonOffset.offset".split(" "),Ga={0:0,1:1,zero:0,one:1,"src color":768,"one minus src color":769,"src alpha":770,"one minus src alpha":771,"dst color":774,"one minus dst color":775,"dst alpha":772,"one minus dst alpha":773,"constant color":32769,"one minus constant color":32770,"constant alpha":32771,
"one minus constant alpha":32772,"src alpha saturate":776},Xa={never:512,less:513,"<":513,equal:514,"=":514,"==":514,"===":514,lequal:515,"<=":515,greater:516,">":516,notequal:517,"!=":517,"!==":517,gequal:518,">=":518,always:519},Pa={0:0,zero:0,keep:7680,replace:7681,increment:7682,decrement:7683,"increment wrap":34055,"decrement wrap":34056,invert:5386},wb={cw:2304,ccw:2305},xb=new Z(!1,!1,!1,function(){}),Xb=function(a,b){function c(){this.endQueryIndex=this.startQueryIndex=-1;this.sum=0;this.stats=
null}function e(a,b,d){var e=p.pop()||new c;e.startQueryIndex=a;e.endQueryIndex=b;e.sum=0;e.stats=d;f.push(e)}if(!b.ext_disjoint_timer_query)return null;var g=[],d=[],p=[],f=[],r=[],q=[];return{beginQuery:function(a){var c=g.pop()||b.ext_disjoint_timer_query.createQueryEXT();b.ext_disjoint_timer_query.beginQueryEXT(35007,c);d.push(c);e(d.length-1,d.length,a)},endQuery:function(){b.ext_disjoint_timer_query.endQueryEXT(35007)},pushScopeStats:e,update:function(){var a,c;a=d.length;if(0!==a){q.length=
Math.max(q.length,a+1);r.length=Math.max(r.length,a+1);r[0]=0;var e=q[0]=0;for(c=a=0;c<d.length;++c){var k=d[c];b.ext_disjoint_timer_query.getQueryObjectEXT(k,34919)?(e+=b.ext_disjoint_timer_query.getQueryObjectEXT(k,34918),g.push(k)):d[a++]=k;r[c+1]=e;q[c+1]=a}d.length=a;for(c=a=0;c<f.length;++c){var e=f[c],h=e.startQueryIndex,k=e.endQueryIndex;e.sum+=r[k]-r[h];h=q[h];k=q[k];k===h?(e.stats.gpuTime+=e.sum/1E6,p.push(e)):(e.startQueryIndex=h,e.endQueryIndex=k,f[a++]=e)}f.length=a}},getNumPendingQueries:function(){return d.length},
clear:function(){g.push.apply(g,d);for(var a=0;a<g.length;a++)b.ext_disjoint_timer_query.deleteQueryEXT(g[a]);d.length=0;g.length=0},restore:function(){d.length=0;g.length=0}}};return function(a){function b(){if(0===G.length)B&&B.update(),ca=null;else{ca=Ya.next(b);t();for(var a=G.length-1;0<=a;--a){var c=G[a];c&&c(O,null,0)}k.flush();B&&B.update()}}function c(){!ca&&0<G.length&&(ca=Ya.next(b))}function e(){ca&&(Ya.cancel(b),ca=null)}function g(a){a.preventDefault();e();U.forEach(function(a){a()})}
function d(a){k.getError();l.restore();Q.restore();F.restore();A.restore();M.restore();K.restore();B&&B.restore();V.procs.refresh();c();W.forEach(function(a){a()})}function p(a){function b(a){var c={},d={};Object.keys(a).forEach(function(b){var e=a[b];la.isDynamic(e)?d[b]=la.unbox(e,b):c[b]=e});return{dynamic:d,"static":c}}function c(a){for(;m.length<a;)m.push(null);return m}var d=b(a.context||{}),e=b(a.uniforms||{}),f=b(a.attributes||{}),g=b(function(a){function b(a){if(a in c){var d=c[a];delete c[a];
Object.keys(d).forEach(function(b){c[a+"."+b]=d[b]})}}var c=E({},a);delete c.uniforms;delete c.attributes;delete c.context;"stencil"in c&&c.stencil.op&&(c.stencil.opBack=c.stencil.opFront=c.stencil.op,delete c.stencil.op);b("blend");b("depth");b("cull");b("stencil");b("polygonOffset");b("scissor");b("sample");return c}(a));a={gpuTime:0,cpuTime:0,count:0};var d=V.compile(g,f,e,d,a),h=d.draw,k=d.batch,l=d.scope,m=[];return E(function(a,b){var d;if("function"===typeof a)return l.call(this,null,a,0);
if("function"===typeof b)if("number"===typeof a)for(d=0;d<a;++d)l.call(this,null,b,d);else if(Array.isArray(a))for(d=0;d<a.length;++d)l.call(this,a[d],b,d);else return l.call(this,a,b,0);else if("number"===typeof a){if(0<a)return k.call(this,c(a|0),a|0)}else if(Array.isArray(a)){if(a.length)return k.call(this,a,a.length)}else return h.call(this,a)},{stats:a})}function f(a,b){var c=0;V.procs.poll();var d=b.color;d&&(k.clearColor(+d[0]||0,+d[1]||0,+d[2]||0,+d[3]||0),c|=16384);"depth"in b&&(k.clearDepth(+b.depth),
c|=256);"stencil"in b&&(k.clearStencil(b.stencil|0),c|=1024);k.clear(c)}function r(a){G.push(a);c();return{cancel:function(){function b(){var a=yb(G,b);G[a]=G[G.length-1];--G.length;0>=G.length&&e()}var c=yb(G,a);G[c]=b}}}function q(){var a=S.viewport,b=S.scissor_box;a[0]=a[1]=b[0]=b[1]=0;O.viewportWidth=O.framebufferWidth=O.drawingBufferWidth=a[2]=b[2]=k.drawingBufferWidth;O.viewportHeight=O.framebufferHeight=O.drawingBufferHeight=a[3]=b[3]=k.drawingBufferHeight}function t(){O.tick+=1;O.time=z();
q();V.procs.poll()}function m(){q();V.procs.refresh();B&&B.update()}function z(){return(zb()-D)/1E3}a=Eb(a);if(!a)return null;var k=a.gl,h=k.getContextAttributes();k.isContextLost();var l=Fb(k,a);if(!l)return null;var u=Bb(),v={bufferCount:0,elementsCount:0,framebufferCount:0,shaderCount:0,textureCount:0,cubeCount:0,renderbufferCount:0,maxTextureUnits:0},x=l.extensions,B=Xb(k,x),D=zb(),J=k.drawingBufferWidth,P=k.drawingBufferHeight,O={tick:0,time:0,viewportWidth:J,viewportHeight:P,framebufferWidth:J,
framebufferHeight:P,drawingBufferWidth:J,drawingBufferHeight:P,pixelRatio:a.pixelRatio},R=Vb(k,x),J=Pb(k,x,R,u),F=Gb(k,v,a,J),T=Hb(k,x,F,v),Q=Qb(k,u,v,a),A=Kb(k,x,R,function(){V.procs.poll()},O,v,a),M=Wb(k,x,R,v,a),K=Ob(k,x,R,A,M,v),V=Tb(k,u,x,R,F,T,A,K,{},J,Q,{elements:null,primitive:4,count:-1,offset:0,instances:-1},O,B,a),u=Rb(k,K,V.procs.poll,O,h,x,R),S=V.next,L=k.canvas,G=[],U=[],W=[],Z=[a.onDestroy],ca=null;L&&(L.addEventListener("webglcontextlost",g,!1),L.addEventListener("webglcontextrestored",
d,!1));var aa=K.setFBO=p({framebuffer:la.define.call(null,1,"framebuffer")});m();h=E(p,{clear:function(a){if("framebuffer"in a)if(a.framebuffer&&"framebufferCube"===a.framebuffer_reglType)for(var b=0;6>b;++b)aa(E({framebuffer:a.framebuffer.faces[b]},a),f);else aa(a,f);else f(null,a)},prop:la.define.bind(null,1),context:la.define.bind(null,2),"this":la.define.bind(null,3),draw:p({}),buffer:function(a){return F.create(a,34962,!1,!1)},elements:function(a){return T.create(a,!1)},texture:A.create2D,cube:A.createCube,
renderbuffer:M.create,framebuffer:K.create,framebufferCube:K.createCube,attributes:h,frame:r,on:function(a,b){var c;switch(a){case "frame":return r(b);case "lost":c=U;break;case "restore":c=W;break;case "destroy":c=Z}c.push(b);return{cancel:function(){for(var a=0;a<c.length;++a)if(c[a]===b){c[a]=c[c.length-1];c.pop();break}}}},limits:R,hasExtension:function(a){return 0<=R.extensions.indexOf(a.toLowerCase())},read:u,destroy:function(){G.length=0;e();L&&(L.removeEventListener("webglcontextlost",g),
L.removeEventListener("webglcontextrestored",d));Q.clear();K.clear();M.clear();A.clear();T.clear();F.clear();B&&B.clear();Z.forEach(function(a){a()})},_gl:k,_refresh:m,poll:function(){t();B&&B.update()},now:z,stats:v});a.onDone(null,h);return h}});

},{}],46:[function(require,module,exports){
var resolve = require('soundcloud-resolve')
var fonts = require('google-fonts')
var minstache = require('minstache')
var insert = require('insert-css')
var fs = require('fs')

var icons = {
    black: 'https://developers.soundcloud.com/assets/logo_black.png'
  , white: 'https://developers.soundcloud.com/assets/logo_white.png'
}

module.exports = badge
function noop(err){ if (err) throw err }

var inserted = false
var gwfadded = false
var template = null

function badge(options, callback) {
  if (!inserted) insert(".npm-scb-wrap {\n  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  font-weight: 200;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 999;\n}\n\n.npm-scb-wrap a {\n  text-decoration: none;\n  color: #000;\n}\n.npm-scb-white\n.npm-scb-wrap a {\n  color: #fff;\n}\n\n.npm-scb-inner {\n  position: absolute;\n  top: -120px; left: 0;\n  padding: 8px;\n  width: 100%;\n  height: 150px;\n  z-index: 2;\n  -webkit-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n     -moz-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n      -ms-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n       -o-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n          transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;\n}\n.npm-scb-wrap:hover\n.npm-scb-inner {\n  top: 0;\n}\n\n.npm-scb-artwork {\n  position: absolute;\n  top: 16px; left: 16px;\n  width: 104px; height: 104px;\n  box-shadow: 0 0 8px -3px #000;\n  outline: 1px solid rgba(0,0,0,0.1);\n  z-index: 2;\n}\n.npm-scb-white\n.npm-scb-artwork {\n  outline: 1px solid rgba(255,255,255,0.1);\n  box-shadow: 0 0 10px -2px rgba(255,255,255,0.9);\n}\n\n.npm-scb-info {\n  position: absolute;\n  top: 16px;\n  left: 120px;\n  width: 300px;\n  z-index: 1;\n}\n\n.npm-scb-info > a {\n  display: block;\n}\n\n.npm-scb-now-playing {\n  font-size: 12px;\n  line-height: 12px;\n  position: absolute;\n  width: 500px;\n  z-index: 1;\n  padding: 15px 0;\n  top: 0; left: 138px;\n  opacity: 1;\n  -webkit-transition: opacity 0.25s;\n     -moz-transition: opacity 0.25s;\n      -ms-transition: opacity 0.25s;\n       -o-transition: opacity 0.25s;\n          transition: opacity 0.25s;\n}\n\n.npm-scb-wrap:hover\n.npm-scb-now-playing {\n  opacity: 0;\n}\n\n.npm-scb-white\n.npm-scb-now-playing {\n  color: #fff;\n}\n.npm-scb-now-playing > a {\n  font-weight: bold;\n}\n\n.npm-scb-info > a > p {\n  margin: 0;\n  padding-bottom: 0.25em;\n  line-height: 1.35em;\n  margin-left: 1em;\n  font-size: 1em;\n}\n\n.npm-scb-title {\n  font-weight: bold;\n}\n\n.npm-scb-icon {\n  position: absolute;\n  top: 120px;\n  padding-top: 0.75em;\n  left: 16px;\n}\n"), inserted = true
  if (!template) template = minstache.compile("<div class=\"npm-scb-wrap\">\n  <div class=\"npm-scb-inner\">\n    <a target=\"_blank\" href=\"{{!urls.song}}\">\n      <img class=\"npm-scb-icon\" src=\"{{!icon}}\">\n      <img class=\"npm-scb-artwork\" src=\"{{!artwork}}\">\n    </a>\n    <div class=\"npm-scb-info\">\n      <a target=\"_blank\" href=\"{{!urls.song}}\">\n        <p class=\"npm-scb-title\">{{!title}}</p>\n      </a>\n      <a target=\"_blank\" href=\"{{!urls.artist}}\">\n        <p class=\"npm-scb-artist\">{{!artist}}</p>\n      </a>\n    </div>\n  </div>\n  <div class=\"npm-scb-now-playing\">\n    Now Playing:\n    <a href=\"{{!urls.song}}\">{{!title}}</a>\n    by\n    <a href=\"{{!urls.artist}}\">{{!artist}}</a>\n  </div>\n</div>")

  if (!gwfadded && options.getFonts) {
    fonts.add({ 'Open Sans': [300, 600] })
    gwfadded = true
  }

  options = options || {}
  callback = callback || noop

  var div   = options.el || document.createElement('div')
  var icon  = !('dark' in options) || options.dark ? 'black' : 'white'
  var id    = options.client_id
  var song  = options.song

  resolve(id, song, function(err, json) {
    if (err) return callback(err)
    if (json.kind !== 'track') throw new Error(
      'soundcloud-badge only supports individual tracks at the moment'
    )

    div.classList[
      icon === 'black' ? 'remove' : 'add'
    ]('npm-scb-white')

    div.innerHTML = template({
        artwork: json.artwork_url || json.user.avatar_url
      , artist: json.user.username
      , title: json.title
      , icon: icons[icon]
      , urls: {
          song: json.permalink_url
        , artist: json.user.permalink_url
      }
    })

    document.body.appendChild(div)

    callback(null, json.stream_url + '?client_id=' + id, json, div)
  })

  return div
}

},{"fs":8,"google-fonts":17,"insert-css":20,"minstache":21,"soundcloud-resolve":47}],47:[function(require,module,exports){
var qs  = require('querystring')
var xhr = require('xhr')

module.exports = resolve

function resolve(id, goal, callback) {
  var uri = 'https://api.soundcloud.com/resolve.json?' + qs.stringify({
      url: goal
    , client_id: id
  })

  xhr({
      uri: uri
    , method: 'GET'
  }, function(err, res, body) {
    if (err) return callback(err)
    try {
      body = JSON.parse(body)
    } catch(e) {
      return callback(e)
    }
    if (body.errors) return callback(new Error(
      body.errors[0].error_message
    ))

    var stream_url = body.kind === 'track'
      && body.stream_url + '?client_id=' + id

    return callback(null, body, stream_url)
  })
}

},{"querystring":43,"xhr":52}],48:[function(require,module,exports){
'use strict'

var parseUnit = require('parse-unit')

module.exports = toPX

var PIXELS_PER_INCH = getSizeBrutal('in', document.body) // 96


function getPropertyInPX(element, prop) {
  var parts = parseUnit(getComputedStyle(element).getPropertyValue(prop))
  return parts[0] * toPX(parts[1], element)
}

//This brutal hack is needed
function getSizeBrutal(unit, element) {
  var testDIV = document.createElement('div')
  testDIV.style['height'] = '128' + unit
  element.appendChild(testDIV)
  var size = getPropertyInPX(testDIV, 'height') / 128
  element.removeChild(testDIV)
  return size
}

function toPX(str, element) {
  if (!str) return null

  element = element || document.body
  str = (str + '' || 'px').trim().toLowerCase()
  if(element === window || element === document) {
    element = document.body
  }

  switch(str) {
    case '%':  //Ambiguous, not sure if we should use width or height
      return element.clientHeight / 100.0
    case 'ch':
    case 'ex':
      return getSizeBrutal(str, element)
    case 'em':
      return getPropertyInPX(element, 'font-size')
    case 'rem':
      return getPropertyInPX(document.body, 'font-size')
    case 'vw':
      return window.innerWidth/100
    case 'vh':
      return window.innerHeight/100
    case 'vmin':
      return Math.min(window.innerWidth, window.innerHeight) / 100
    case 'vmax':
      return Math.max(window.innerWidth, window.innerHeight) / 100
    case 'in':
      return PIXELS_PER_INCH
    case 'cm':
      return PIXELS_PER_INCH / 2.54
    case 'mm':
      return PIXELS_PER_INCH / 25.4
    case 'pt':
      return PIXELS_PER_INCH / 72
    case 'pc':
      return PIXELS_PER_INCH / 6
    case 'px':
      return 1
  }

  // detect number of units
  var parts = parseUnit(str)
  if (!isNaN(parts[0]) && parts[1]) {
    var px = toPX(parts[1], element)
    return typeof px === 'number' ? parts[0] * px : null
  }

  return null
}

},{"parse-unit":39}],49:[function(require,module,exports){
var assert = require('assert')
var trie = require('./trie')

module.exports = Wayfarer

// create a router
// str -> obj
function Wayfarer (dft) {
  if (!(this instanceof Wayfarer)) return new Wayfarer(dft)

  var _default = (dft || '').replace(/^\//, '')
  var _trie = trie()

  emit._trie = _trie
  emit.on = on
  emit.emit = emit
  emit.match = match
  emit._wayfarer = true

  return emit

  // define a route
  // (str, fn) -> obj
  function on (route, fn) {
    assert.equal(typeof route, 'string')
    assert.equal(typeof fn, 'function')

    var cb = fn._wayfarer && fn._trie ? fn : proxy
    route = route || '/'
    cb.route = route

    if (cb._wayfarer && cb._trie) {
      _trie.mount(route, cb._trie.trie)
    } else {
      var node = _trie.create(route)
      node.cb = cb
    }

    return emit

    function proxy () {
      return fn.apply(this, Array.prototype.slice.call(arguments))
    }
  }

  // match and call a route
  // (str, obj?) -> null
  function emit (route) {
    var matched = match(route)

    var args = new Array(arguments.length)
    args[0] = matched.params
    for (var i = 1; i < args.length; i++) {
      args[i] = arguments[i]
    }

    return matched.cb.apply(matched.cb, args)
  }

  function match (route) {
    assert.notEqual(route, undefined, "'route' must be defined")

    var matched = _trie.match(route)
    if (matched && matched.cb) return new Route(matched)

    var dft = _trie.match(_default)
    if (dft && dft.cb) return new Route(dft)

    throw new Error("route '" + route + "' did not match")
  }

  function Route (matched) {
    this.cb = matched.cb
    this.route = matched.cb.route
    this.params = matched.params
  }
}

},{"./trie":50,"assert":2}],50:[function(require,module,exports){
var mutate = require('xtend/mutable')
var assert = require('assert')
var xtend = require('xtend')

module.exports = Trie

// create a new trie
// null -> obj
function Trie () {
  if (!(this instanceof Trie)) return new Trie()
  this.trie = { nodes: {} }
}

// create a node on the trie at route
// and return a node
// str -> null
Trie.prototype.create = function (route) {
  assert.equal(typeof route, 'string', 'route should be a string')
  // strip leading '/' and split routes
  var routes = route.replace(/^\//, '').split('/')

  function createNode (index, trie) {
    var thisRoute = (routes.hasOwnProperty(index) && routes[index])
    if (thisRoute === false) return trie

    var node = null
    if (/^:|^\*/.test(thisRoute)) {
      // if node is a name match, set name and append to ':' node
      if (!trie.nodes.hasOwnProperty('$$')) {
        node = { nodes: {} }
        trie.nodes['$$'] = node
      } else {
        node = trie.nodes['$$']
      }

      if (thisRoute[0] === '*') {
        trie.wildcard = true
      }

      trie.name = thisRoute.replace(/^:|^\*/, '')
    } else if (!trie.nodes.hasOwnProperty(thisRoute)) {
      node = { nodes: {} }
      trie.nodes[thisRoute] = node
    } else {
      node = trie.nodes[thisRoute]
    }

    // we must recurse deeper
    return createNode(index + 1, node)
  }

  return createNode(0, this.trie)
}

// match a route on the trie
// and return the node
// str -> obj
Trie.prototype.match = function (route) {
  assert.equal(typeof route, 'string', 'route should be a string')

  var routes = route.replace(/^\//, '').split('/')
  var params = {}

  function search (index, trie) {
    // either there's no match, or we're done searching
    if (trie === undefined) return undefined
    var thisRoute = routes[index]
    if (thisRoute === undefined) return trie

    if (trie.nodes.hasOwnProperty(thisRoute)) {
      // match regular routes first
      return search(index + 1, trie.nodes[thisRoute])
    } else if (trie.name) {
      // match named routes
      try {
        params[trie.name] = decodeURIComponent(thisRoute)
      } catch (e) {
        return search(index, undefined)
      }
      return search(index + 1, trie.nodes['$$'])
    } else if (trie.wildcard) {
      // match wildcards
      try {
        params['wildcard'] = decodeURIComponent(routes.slice(index).join('/'))
      } catch (e) {
        return search(index, undefined)
      }
      // return early, or else search may keep recursing through the wildcard
      return trie.nodes['$$']
    } else {
      // no matches found
      return search(index + 1)
    }
  }

  var node = search(0, this.trie)

  if (!node) return undefined
  node = xtend(node)
  node.params = params
  return node
}

// mount a trie onto a node at route
// (str, obj) -> null
Trie.prototype.mount = function (route, trie) {
  assert.equal(typeof route, 'string', 'route should be a string')
  assert.equal(typeof trie, 'object', 'trie should be a object')

  var split = route.replace(/^\//, '').split('/')
  var node = null
  var key = null

  if (split.length === 1) {
    key = split[0]
    node = this.create(key)
  } else {
    var head = split.join('/')
    key = split[0]
    node = this.create(head)
  }

  mutate(node.nodes, trie.nodes)
  if (trie.name) node.name = trie.name

  // delegate properties from '/' to the new node
  // '/' cannot be reached once mounted
  if (node.nodes['']) {
    Object.keys(node.nodes['']).forEach(function (key) {
      if (key === 'nodes') return
      node[key] = node.nodes[''][key]
    })
    mutate(node.nodes, node.nodes[''].nodes)
    delete node.nodes[''].nodes
  }
}

},{"assert":2,"xtend":54,"xtend/mutable":55}],51:[function(require,module,exports){
var AudioContext = window.AudioContext || window.webkitAudioContext

module.exports = WebAudioAnalyser

function WebAudioAnalyser(audio, ctx, opts) {
  if (!(this instanceof WebAudioAnalyser)) return new WebAudioAnalyser(audio, ctx, opts)
  if (!(ctx instanceof AudioContext)) (opts = ctx), (ctx = null)

  opts = opts || {}
  this.ctx = ctx = ctx || new AudioContext

  if (!(audio instanceof AudioNode)) {
    audio = (audio instanceof Audio || audio instanceof HTMLAudioElement)
      ? ctx.createMediaElementSource(audio)
      : ctx.createMediaStreamSource(audio)
  }

  this.analyser = ctx.createAnalyser()
  this.stereo   = !!opts.stereo
  this.audible  = opts.audible !== false
  this.wavedata = null
  this.freqdata = null
  this.splitter = null
  this.merger   = null
  this.source   = audio

  if (!this.stereo) {
    this.output = this.source
    this.source.connect(this.analyser)
    if (this.audible)
      this.analyser.connect(ctx.destination)
  } else {
    this.analyser = [this.analyser]
    this.analyser.push(ctx.createAnalyser())

    this.splitter = ctx.createChannelSplitter(2)
    this.merger   = ctx.createChannelMerger(2)
    this.output   = this.merger

    this.source.connect(this.splitter)

    for (var i = 0; i < 2; i++) {
      this.splitter.connect(this.analyser[i], i, 0)
      this.analyser[i].connect(this.merger, 0, i)
    }

    if (this.audible)
      this.merger.connect(ctx.destination)
  }
}

WebAudioAnalyser.prototype.waveform = function(output, channel) {
  if (!output) output = this.wavedata || (
    this.wavedata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount)
  )

  var analyser = this.stereo
    ? this.analyser[channel || 0]
    : this.analyser

  analyser.getByteTimeDomainData(output)

  return output
}

WebAudioAnalyser.prototype.frequencies = function(output, channel) {
  if (!output) output = this.freqdata || (
    this.freqdata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount)
  )

  var analyser = this.stereo
    ? this.analyser[channel || 0]
    : this.analyser

  analyser.getByteFrequencyData(output)

  return output
}

},{}],52:[function(require,module,exports){
var window = require("global/window")
var once = require("once")

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ?
        window.XMLHttpRequest : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr

    if (options.cors) {
        xhr = new XDR()
    } else {
        xhr = new XHR()
    }

    var uri = xhr.url = options.uri
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var isJson = false

    if ("json" in options) {
        isJson = true
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(options.json)
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri)
    if (options.cors) {
        xhr.withCredentials = true
    }
    xhr.timeout = "timeout" in options ? options.timeout : 5000

    if ( xhr.setRequestHeader) {
        Object.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key])
        })
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function load() {
        var error = null
        var status = xhr.statusCode = xhr.status
        var body = xhr.body = xhr.response ||
            xhr.responseText || xhr.responseXML

        if (status === 0 || (status >= 400 && status < 600)) {
            var message = xhr.responseText ||
                messages[String(xhr.status).charAt(0)]
            error = new Error(message)

            error.statusCode = xhr.status
        }

        if (isJson) {
            try {
                body = xhr.body = JSON.parse(body)
            } catch (e) {}
        }

        callback(error, xhr, body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":53,"once":38}],53:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window
} else if (typeof global !== "undefined") {
    module.exports = global
} else {
    module.exports = {}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],54:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],55:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1]);
