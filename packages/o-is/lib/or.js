'use strict'

const assign = require('lodash.assign')

const createOrClass = (oIsProto) => {
	function Or(parent, tests, boundKeys) {
		this.parent = parent
		this._boundKeys = boundKeys
		this.tests = tests
	}
	Or.prototype = assign(Object.create(null), oIsProto)
	Or.prototype._create = function(tests, boundKeys) {
		return new Or(this.parent, tests, boundKeys)
	}
	Or.prototype.end = function() {
		return this.parent._cons({
			type: 'or',
			tests: this.tests
		})
	}
	// Since by default the chain of tests work like an "and",
	// I just need to add this option to the Or prototype
	Or.prototype.and = function() {
		return new this._And(this, [], this._boundKeys)
	}

	function And(parent, tests, boundKeys) {
		this.parent = parent
		this._boundKeys = boundKeys
		this.tests = tests
	}
	And.prototype = assign(Object.create(null), oIsProto)

	And.prototype._create = function(tests, boundKeys) {
		return new And(this.parent, tests, boundKeys)
	}
	And.prototype.end = function() {
		return this.parent._cons({
			type: 'and',
			tests: this.tests
		})
	}

	Or.prototype._And = And

	return Or
}

module.exports = {createOrClass}

