# abab

A module that implements `window.atob` and `window.btoa` according to the [WHATWG spec](https://html.spec.whatwg.org/multipage/webappapis.html#atob). The code is originally from [w3c/web-platform-tests](https://github.com/w3c/web-platform-tests/blob/master/html/webappapis/atob/base64.html).

Compatibility: io.js (all major versions), browsers (using browserify or webpack)

Install with `npm`:

```sh
npm install abab
```

## API

### `btoa` (base64 encode)

```js
const btoa = require('abab').btoa;
btoa('Hello, world!'); // 'SGVsbG8sIHdvcmxkIQ=='
```

### `atob` (base64 decode)

```js 
const atob = require('abab').atob;
atob('SGVsbG8sIHdvcmxkIQ=='); // 'Hello, world!'
```

#### Valid characters

[Per the spec](https://html.spec.whatwg.org/multipage/webappapis.html#atob:dom-windowbase64-btoa-3), `btoa` will accept strings "containing only characters in the range `U+0000` to `U+00FF`." If passed a string with characters above `U+00FF`, `btoa` will return `null`. If `atob` is passed a string that is not base64-valid, it will also return `null`. In both cases when `null` is returned, the spec calls for throwing a `DOMException` of type `InvalidCharacterError`.

## Contributing

- See the [PR checklist](CONTRIBUTING.md#checklists)

# TODO

- [ ] Add real tests
- [x] Add .travis.yml
- [x] Test all major versions of io.js on Travis CI
- [x] Add deploy checklist
- [x] Fill in rest of README

After 1.0:

- [ ] Investigate linting situation (clone jsdom's?) 
- [ ] Investigate browser testing story
- [ ] After above, update compatibility section with specific browsers
- [ ] Figure out LICENSE situation - the copyright is owned by Google, I believe

# Ideas

- If we can set up browser testing (Sauce?), would be cool to test against every browser's implementation of atob/btoa
