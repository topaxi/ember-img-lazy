# ember-img-lazy

Lazily load images once they enter your viewport.

Uses `IntersectionObserver`, does not provide a polyfill and loads
images immediately if `IntersectionObserver` is not available.

## Usage
```handlebars
{{img-lazy src="smile.png" width=200 height=200 alt="Smile"}}
```

`{{img-lazy}}` will add the class `img-lazy--loading` once it starts
fetching the image source and applies the class `img-lazy--loaded` and `src`
property when it finishes.

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

      // The default setting is useful if one wants to show a
      // placeholder loading img (i.e. through a background-image).
      // Disable to not wait for the images to load to set the src url.
      // This is mostly useful with progressive encoded images.
      // Default: false
      setSrcImmediately: false,

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

## FadeIn Example

```css
@keyframes fade-in {
  to {
    opacity: 1;
  }
}

.img-lazy {
  opacity: 0;
}
.img-lazy--loaded {
  animation: 200ms fade-in forwards;
  background: none;
}
```

Or with placeholder style, flickers if `immediately` is set (default `false`).

```css
@keyframes fade-in {
  to {
    opacity: 1;
  }
}

.img-lazy {
  opacity: 0;
}
.img-lazy--loading {
  opacity: 1;
  background: rgba(238, 238, 236, 0.8);
}
.img-lazy--loaded {
  animation: 200ms fade-in forwards;
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

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
