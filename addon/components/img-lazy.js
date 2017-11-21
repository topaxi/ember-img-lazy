import RSVP from 'rsvp'
import { scheduleOnce } from '@ember/runloop'
import { oneWay, not } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import Component from '@ember/component'
import { set, get, computed } from '@ember/object'

const { Promise } = RSVP

const emptySvg = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width|0}" height="${height|0}"></svg>`

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
    '_error:img-lazy--error',
  ],

  lazyFastBoot: oneWay('config.ember-img-lazy.lazyFastBoot'),
  immediately: oneWay('config.ember-img-lazy.setSrcImmediately'),

  _src: computed('width', 'height', 'src', function() {
    if ((isFastBoot && !get(this, 'lazyFastBoot')) ||
      (!isFastBoot && !get(this, 'observer.hasIntersectionObserver'))) {
      return get(this, 'src')
    }

    return placeholder(get(this, 'width'), get(this, 'height'))
  }),

  _srcset: computed('srcset', function() {
    if ((isFastBoot && !get(this, 'lazyFastBoot')) ||
      (!isFastBoot && !get(this, 'observer.hasIntersectionObserver'))) {
      return get(this, 'srcset')
    }
  }),

  _error: null,
  _loaded: not('observer.hasIntersectionObserver'),
  _loading: oneWay('observer.hasIntersectionObserver'),

  src: null,
  title: null,
  alt: null,
  width: null,
  height: null,
  srcset: null,
  sizes: null,

  attributeBindings: [
    '_src:src',
    '_srcset:srcset',
    'title',
    'alt',
    'width',
    'height',
    'sizes'
  ],

  didInsertElement() {
    this._super(...arguments)
    get(this, 'observer').observe(this.element)
  },

  willDestroyElement() {
    this._super(...arguments)
    get(this, 'observer').unobserve(this.element)
  },

  loadImage() {
    let src = get(this, 'src')
    let srcset = get(this, 'srcset')

    if (src === null && srcset === null) {
      return
    }

    this._setIsLoading()

    if (get(this, 'immediately') || srcset) {
      set(this, '_src', src)
      set(this, '_srcset', srcset)

      scheduleOnce('afterRender', this, () => {
        if (isLoaded(this.element)) {
          this._setIsLoaded()

          return
        }

        this.element.onload = () => this._setIsLoaded()
        this.element.onerror = err => this._setError(err)
      })

      return
    }

    fetchImage(src)
      .then(() => {
        if (this.isDestroyed === true) {
          return
        }
        set(this, '_src', src)
        this._setIsLoaded()
      })
      .catch(err => {
        this._setError(err)
      })
  },

  _setIsLoaded() {
    if (this.isDestroyed === true) {
      return
    }

    set(this, '_loaded', true)
    set(this, '_loading', false)
    set(this, '_error', null)
  },

  _setIsLoading() {
    if (this.isDestroyed === true) {
      return
    }

    set(this, '_loaded', false)
    set(this, '_loading', true)
    set(this, '_error', null)
  },

  _setError(err) {
    if (this.isDestroyed === true) {
      return
    }

    set(this, '_loaded', false)
    set(this, '_loading', false)
    set(this, '_error', err || true)
  },
})

function isLoaded(img) {
  return img.completed === true || img.readyState === 4
}

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    let img = new Image
    img.src = url

    if (isLoaded(img)) {
      resolve(url)
    }
    else {
      img.onload = resolve.bind(null, url)
      img.onerror = reject
    }
  })
}
