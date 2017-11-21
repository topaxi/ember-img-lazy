import $ from 'jquery'
import { test } from 'qunit'
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance'

moduleForAcceptance('Acceptance | lazyload')

test('it lazyloads', function(assert) {
  visit('/')

  andThen(function() {
    assert.equal(currentURL(), '/')
    assert.equal($('img').prop('width'), 300)
    assert.equal($('img').prop('height'), 205)
    assert.ok(/%3Csvg/.test($('img').prop('src')), 'renders a placeholder svg')
  })

  let done = assert.async()

  setTimeout(function() {
    assert.equal($('img').prop('width'), 300)
    assert.equal($('img').prop('height'), 205)
    assert.equal(
      $('img').prop('src'),
      'http://localhost:7357/assets/ninja-sleepin.svg'
    )

    done()
  }, 5000)
})
