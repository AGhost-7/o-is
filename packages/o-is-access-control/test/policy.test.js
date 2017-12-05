'use strict'

const Policy = require('../lib/policy')
const oIsDefault = require('../lib/o-is-default')
const assert = require('assert')

const PolicySetMock = function(policies) {
	this._policies = policies
	this._oIs = oIsDefault
}

PolicySetMock.prototype.concat = function(policy) {
	return new PolicySetMock(this._policies.concat(policy))
}

describe('policy', () => {

	const mock = new PolicySetMock([])

	it('setters', () => {
		const policy = new Policy(mock)
			.effect('allow')
			.action('create')
			.target('video')
		assert.equal(policy._effect, 'allow')
		assert.equal(policy._action, 'create')
		assert.equal(policy._target, 'video')
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
})
