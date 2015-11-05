'use strict';

const assert = require('assert');
const btoa = require('..').btoa;
const atob = require('..').atob;

const plaintext = "Hello, world!";

describe('abab', function () {

  it('works for the happiest of happy paths', function () {
    assert.equal(atob(btoa(plaintext)), plaintext);
  });

});
