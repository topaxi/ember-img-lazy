# ember-img-lazy

Lazily load images once they enter your viewport.

Uses `IntersectionObserver`, does not provide a polyfill and loads
images immediately if `IntersectionObserver` is not available.

## Usage
```handlebars
{{img-lazy src="smile.png" width=200 height=200 alt="Smile"}}
```

## Configuration

`config/environment`:
```javascript
module.exports = function(environment) {
  let ENV = {
    // ...
    'ember-img-lazy': {
      // Don't load images in fastboot, this effectively
      // shows the placeholder image until ember takes over.
      // Default: false
      lazyFastBoot: true,

      // Config passed to IntersectionObserver.
      observerConfig: {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    }
  }
  // ...
}
```

## Installation

* `ember install ember-img-lazy`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
