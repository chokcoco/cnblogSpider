'use strict';

const assert = require('assert');
const atob = require('..').atob;

const cases = ["", "abcd", " abcd", "abcd ", " abcd===", "abcd=== ",
    "abcd ===", "a", "ab", "abc", "abcde", String.fromCharCode(0xd800, 0xdc00),
    "=", "==", "===", "====", "=====",
    "a=", "a==", "a===", "a====", "a=====",
    "ab=", "ab==", "ab===", "ab====", "ab=====",
    "abc=", "abc==", "abc===", "abc====", "abc=====",
    "abcd=", "abcd==", "abcd===", "abcd====", "abcd=====",
    "abcde=", "abcde==", "abcde===", "abcde====", "abcde=====",
    "=a", "=a=", "a=b", "a=b=", "ab=c", "ab=c=", "abc=d", "abc=d=",
    // With whitespace
    "ab\tcd", "ab\ncd", "ab\fcd", "ab\rcd", "ab cd", "ab\u00a0cd",
    "ab\t\n\f\r cd", " \t\n\f\r ab\t\n\f\r cd\t\n\f\r ",
    "ab\t\n\f\r =\t\n\f\r =\t\n\f\r ",
    // Test if any bits are set at the end.  These should all be fine, since
    // they end with A, which becomes 0:
    "A", "/A", "//A", "///A", "////A",
    // These are all bad, since they end in / (= 63, all bits set) but their
    // length isn't a multiple of four characters, so they can't be output by
    // btoa().  Thus one might expect some UAs to throw exceptions or otherwise
    // object, since they could never be output by btoa(), so they're good to
    // test.
    "/", "A/", "AA/", "AAAA/",
    // But this one is possible:
    "AAA/",
    // Binary-safety tests
    "\0nonsense", "abcd\0nonsense",
    // WebIDL tests
    undefined, null, 7, 12, 1.5, true, false, NaN, +Infinity, -Infinity, 0, -0,
    {toString: function() { return "foo" }},
    {toString: function() { return "abcd" }},
];

const answers = [[],[105,183,29],[105,183,29],[105,183,29],null,null,null,null,[105],[105,183],null,null,null,null,null,null,null,null,null,null,null,null,null,[105],null,null,null,[105,183],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[105,183,29],[105,183,29],[105,183,29],[105,183,29],[105,183,29],null,[105,183,29],[105,183,29],[105],null,[252],[255,240],[255,255,192],null,null,[3],[0,15],null,[0,0,63],null,null,null,[158,233,101],null,[215],null,[182,187,158],null,[53,163],[34,119,226,158,43,114],null,null,null,[126,138],[105,183,29]];

describe('atob', function () {
 
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
      assert.strictEqual(atob(input), expected);
    });
  });

});

// Used to generate answers (in Chrome):
// JSON.stringify(tests.map(function (t) { var x = null; try { x = atob(t); } catch (e) {} if (x !== null) { x = x.split('').map(function (c) { return c.charCodeAt(0); })} return x; }));
