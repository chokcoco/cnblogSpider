'use strict';

const assert = require('assert');
const btoa = require('..').btoa;

const cases = ["עברית", "", "ab", "abc", "abcd", "abcde",
  // This one is thrown in because IE9 seems to fail atob(btoa()) on it.  Or
  // possibly to fail btoa().  I actually can't tell what's happening here,
  // but it doesn't hurt.
  "\xff\xff\xc0",
  // Is your DOM implementation binary-safe?
  "\0a", "a\0b",
  // WebIDL tests.
  undefined, null, 7, 12, 1.5, true, false, NaN, +Infinity, -Infinity, 0, -0,
  {toString: function() { return "foo" }},
];

const answers = [null,[],[89,87,73,61],[89,87,74,106],[89,87,74,106,90,65,61,61],[89,87,74,106,90,71,85,61],[47,47,47,65],[65,71,69,61],[89,81,66,105],[100,87,53,107,90,87,90,112,98,109,86,107],[98,110,86,115,98,65,61,61],[78,119,61,61],[77,84,73,61],[77,83,52,49],[100,72,74,49,90,81,61,61],[90,109,70,115,99,50,85,61],[84,109,70,79],[83,87,53,109,97,87,53,112,100,72,107,61],[76,85,108,117,90,109,108,117,97,88,82,53],[77,65,61,61],[77,65,61,61],[90,109,57,118]];

describe('btoa', function () {
 
  cases.forEach(function (input, index) {
    let expected = answers[index];

    // TODO: update answers so this is unnecessary
    if (expected instanceof Array) {
      expected = String.fromCharCode.apply(null, expected);
    }

    const inputDescriptor = typeof input === 'string'
      ? input.replace(/[^\x60-\x7F]/g, '?') 
      : input;
    const expectedDescriptor = typeof expected === 'string' 
      ? expected.replace(/[^\x60-\x7F]/g, '?') 
      : expected;

    it(`correctly converts ${inputDescriptor} into ${expectedDescriptor}`, function () {
      assert.strictEqual(btoa(input), expected);
    });
  });

});

// Used to generate answers (in Chrome):
// JSON.stringify(tests.map(function (t) { var x = null; try { x = atob(t); } catch (e) {} if (x !== null) { x = x.split('').map(function (c) { return c.charCodeAt(0); })} return x; }));
