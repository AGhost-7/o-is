'use strict'

const Policy = require('../lib/policy')
const RuleDefault = require('../lib/rule-default')
const assert = require('assert').strict

const PolicySetMock = function(policies) {
  this._policies = policies
  this._Rule = RuleDefault
}

PolicySetMock.prototype.concat = function(policy) {
  return new PolicySetMock(this._policies.concat(policy))
}

describe('policy', () => {
  const mock = new PolicySetMock([])

  it('setters', () => {
    const policy = new Policy(mock)
      .name('create vids')
      .effect('allow')
      .action('create')
      .target('video')
    assert.equal(policy._effect, 'allow')
    assert.deepEqual(policy._action, ['create'])
    assert.deepEqual(policy._target, ['video'])
    assert.equal(policy._name, 'create vids')
  })

  it('condition', () => {
    const policy = new Policy(mock)
      .condition()
      .equal('foo', 'bar')
      .end()

    assert.equal(policy._condition[0].key, 'foo')
    assert.equal(policy._condition[0].value, 'bar')
    assert.equal(policy._condition[0].type, 'equal')
  })

  it('external condition', () => {
    const isAdmin = RuleDefault().true('isAdmin')
    const policy = new Policy(mock)
      .effect('allow')
      .condition(isAdmin)
      .action('create')
      .target('video')

    assert.equal(policy._condition[0].key, 'isAdmin')
    assert.equal(policy._condition[0].type, 'true')
    assert.equal(policy._effect, 'allow')
    assert.deepEqual(policy._action, ['create'])
  })

  it('no condition is always applied', () => {
    const deny = new Policy(mock)
      .effect('deny')
      .action('create')
      .target('user')
    assert(!deny.decision({ action: 'create', target: 'user' }))
    const allow = new Policy(mock)
      .effect('allow')
      .action('create')
      .target('user')
    assert(allow.decision({ action: 'create', target: 'user' }))
  })
})
