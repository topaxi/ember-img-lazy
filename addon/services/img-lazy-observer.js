import { assign } from '@ember/polyfills'
import Service from '@ember/service'
import { get } from '@ember/object'
import { run } from '@ember/runloop'
import config from 'ember-get-config';

const DEFAULT_OBSERVER_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01,
}

export default Service.extend({
  observer: null,

  config,

  _config: null,

  init() {
    this._super()

    this.hasIntersectionObserver = typeof FastBoot === 'undefined' &&
      'IntersectionObserver' in window

    if (this.hasIntersectionObserver) {
      this.components = []
      this._config = assign({},
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

    this.observer = new IntersectionObserver(this.onIntersection, this._config)
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

    try {
      this.observer.unobserve(component.element)
    }
    catch (e) {
      console.error(e) // eslint-disable-line
    }

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
          component.loadImage()
        }
      }
    }
  },

  getComponent(img) {
    return this.components.find(c => c.element === img)
  },
})
