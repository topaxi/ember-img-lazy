import { oneWay } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';

const emptySvg = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`

// Build an svg of the given size to prelayout the correct space
const placeholder = (width, height) => width && height ?
  `data:image/svg+xml;charset=utf8,${encodeURIComponent(emptySvg(width, height))}` :
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI='

const isFastBoot = typeof FastBoot !== 'undefined'

export default Component.extend({
  tagName: 'img',

  config: service(),
  observer: service('img-lazy-observer'),

  classNames: [ 'img-lazy' ],
  classNameBindings: [
    '_loaded:img-lazy--loaded',
    '_loading:img-lazy--loading',
  ],

  lazyFastBoot: oneWay('config.ember-img-lazy.lazyFastBoot'),

  _src: computed('width', 'height', 'src', function() {
    if ((isFastBoot && !get(this, 'lazyFastBoot')) ||
        (!isFastBoot && !get(this, 'observer.hasIntersectionObserver'))) {
      return this.get('src')
    }

    return placeholder(get(this, 'width'), get(this, 'height'))
  }),
  _loaded: false,
  _loading: oneWay('observer.hasIntersectionObserver'),

  src: null,
  title: null,
  alt: null,
  width: null,
  height: null,

  attributeBindings: [
    '_src:src',
    'title',
    'alt',
    'width',
    'height',
  ],

  didInsertElement() {
    get(this, 'observer').observe(this)
  },

  willDestroyElement() {
    get(this, 'observer').unobserve(this)
  },
})
