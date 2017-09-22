import { assign } from '@ember/polyfills';
import Service, { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import { run } from '@ember/runloop';
import RSVP from 'rsvp'

const { Promise } = RSVP
const DEFAULT_OBSERVER_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01,
}

export default Service.extend({
  observer: null,

  config: service(),

  init() {
    this._super();

    this.hasIntersectionObserver = typeof FastBoot === 'undefined' &&
      'IntersectionObserver' in window

    if (this.hasIntersectionObserver) {
      this.components = []
      this.config = assign({},
        DEFAULT_OBSERVER_CONFIG,
        get(this, 'config.ember-img-lazy.observerConfig') || {}
      )
      this.onIntersection = run.bind(this, this.onIntersection)
    }
  },

  createObserver() {
    if (this.observer) {
      throw new Error('There is already an intersection observer present')
    }

    this.observer = new IntersectionObserver(this.onIntersection, this.config)
  },

  stopObserver() {
    this.observer.disconnect()
    this.observer = null
  },

  observe(component) {
    if (this.hasIntersectionObserver === false) {
      return
    }

    if (this.observer === null) {
      this.createObserver()
    }

    this.observer.observe(component.element)
    this.components.push(component)
  },

  unobserve(component) {
    if (this.hasIntersectionObserver === false || this.observer === null) {
      return
    }

    this.observer.unobserve(component.element)
    this.components = this.components.filter(c => c !== component)

    if (this.components.length === 0) {
      this.stopObserver()
    }
  },

  onIntersection(entries) {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].intersectionRatio > 0) {
        let component = this.getComponent(entries[i].target)

        if (component !== undefined) {
          this.unobserve(component)
          this.preloadImage(component)
        }
      }
    }
  },

  getComponent(img) {
    return this.components.find(c => c.element === img)
  },

  preloadImage(component) {
    const src = get(component, 'src')

    if (src === null) {
      return
    }

    set(component, '_loading', true)
    return fetchImage(src)
      .then(() => {
        if (component.isDestroyed) {
          return;
        }
        set(component, '_src', src)
        set(component, '_loaded', true)
        set(component, '_loading', false)
      })
  }
})

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image
    img.src = url

    if (img.completed || img.readyState === 4) {
      resolve(url)
    }
    else {
      img.onload = resolve.bind(null, url)
      img.onerror = reject
    }
  })
}
