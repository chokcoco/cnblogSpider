"use strict";

const conversions = require("webidl-conversions");
const utils = require("../util.js");
const Impl = require("./EventTarget-impl.js");

const impl = utils.implSymbols["EventTarget"];

function EventTarget() {
  throw new TypeError("Illegal constructor");
}

EventTarget.prototype.addEventListener = function addEventListener(type, callback) {
  if (!this || !this[impl] || !(this instanceof EventTarget)) {
    throw new TypeError("Illegal invocation");
  }
  if (arguments.length < 2) {
    throw new TypeError("Failed to execute 'addEventListener' on 'EventTarget': 2 argument required, but only " + arguments.length + " present.");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 3; ++i) {
    args[i] = arguments[i];
  }
  args[0] = conversions["DOMString"](args[0]);
  return this[impl].addEventListener.apply(this[impl], args);
};

EventTarget.prototype.removeEventListener = function removeEventListener(type, callback) {
  if (!this || !this[impl] || !(this instanceof EventTarget)) {
    throw new TypeError("Illegal invocation");
  }
  if (arguments.length < 2) {
    throw new TypeError("Failed to execute 'removeEventListener' on 'EventTarget': 2 argument required, but only " + arguments.length + " present.");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 3; ++i) {
    args[i] = arguments[i];
  }
  args[0] = conversions["DOMString"](args[0]);
  return this[impl].removeEventListener.apply(this[impl], args);
};

EventTarget.prototype.dispatchEvent = function dispatchEvent(event) {
  if (!this || !this[impl] || !(this instanceof EventTarget)) {
    throw new TypeError("Illegal invocation");
  }
  if (arguments.length < 1) {
    throw new TypeError("Failed to execute 'dispatchEvent' on 'EventTarget': 1 argument required, but only " + arguments.length + " present.");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 1; ++i) {
    args[i] = arguments[i];
  }
  return this[impl].dispatchEvent.apply(this[impl], args);
};

module.exports = {
  create(constructorArgs, privateData) {
    let obj = Object.create(EventTarget.prototype);
    this.setup(obj, constructorArgs, privateData);
    return obj;
  },
  setup(obj, constructorArgs, privateData) {
    if (!privateData) privateData = {};
    privateData.wrapper = obj;
    obj[impl] = new (Function.prototype.bind.apply(Impl.implementation, [null].concat(constructorArgs)))();
    obj[impl][utils.wrapperSymbol] = obj;
  },
  interface: EventTarget,
  expose: {
    Window: { EventTarget: EventTarget },
    Worker: { EventTarget: EventTarget }
  }
};

