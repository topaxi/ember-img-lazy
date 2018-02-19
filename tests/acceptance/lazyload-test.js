import { find, visit, waitUntil } from '@ember/test-helpers'
import { module, test } from 'qunit'
import { setupApplicationTest } from 'ember-qunit'

module('Acceptance | lazyload', function(hooks) {
  setupApplicationTest(hooks)

  test('it lazyloads', async function(assert) {
    await visit('/')

    assert.equal(find('img').width, 300)
    assert.equal(find('img').height, 205)
    assert.ok(/%3Csvg/.test(find('img').src), 'renders a placeholder svg')

    await waitUntil(() => find('img').src.startsWith('http'))

    assert.equal(find('img').width, 300)
    assert.equal(find('img').height, 205)
    assert.equal(
      find('img').src,
      'http://localhost:7357/assets/ninja-sleepin.svg'
    )
  })
})
