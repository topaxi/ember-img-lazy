/* eslint-disable no-console */

import { assign } from '@ember/polyfills'
import Service, { inject as service } from '@ember/service'
import { get } from '@ember/object'
import { run } from '@ember/runloop'
import { getOwner } from '@ember/application';

const DEFAULT_OBSERVER_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01,
}

export default Service.extend({
  config: service(),

  init() {
    this._super(...arguments)

    this.hasIntersectionObserver = typeof FastBoot === 'undefined' &&
      'IntersectionObserver' in window

    this._config = assign({},
      DEFAULT_OBSERVER_CONFIG,
      get(this, 'config.ember-img-lazy.observerConfig')
    )
  },

  // maintains singleton this._observer object
  getObserver() {
    if (this._observer) {
      return this._observer;
    } else if (this.hasIntersectionObserver) {
      this._observer = new IntersectionObserver(
        run.bind(this, this.onIntersection), this._config
      )

      return this._observer
    }
  },

  stopObserver() {
    if (this._observer) {
      this._observer.disconnect()
      this._observer = null
    }
  },

  observe(element) {
    let observer = this.getObserver()

    if (observer) {
      observer.observe(element)
    }
  },

  unobserve(element) {
    if (this._observer) {
      // calling unobserve() for unobserved elements may throw error
      // on some browsers especially Edge
      try {
        this._observer.unobserve(element)
      }
      catch (e) {
        console.warn(e)
      }
    }
  },

  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        let component = this.getComponent(entry.target.id)

        if (component !== undefined) {
          this.unobserve(component.element)
          component.loadImage()
        }
      }
    });
  },

  getComponent(id) {
    return getOwner(this).lookup('-view-registry:main')[id]
  }
})
