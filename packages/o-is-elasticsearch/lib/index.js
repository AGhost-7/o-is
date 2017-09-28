'use strict'

const objOf = (key, val) => {
	const obj = {}
	obj[key] = val
	return obj
}

const term = (key, val) => {
	return {
		term: objOf(key, val)
	}
}

const conversions = {
	_expand(ts) {
		if(!ts.map) console.log('ts:', ts)
		return ts.map((t) => {
			return this[t.type](t)
		})
	},
	lt(obj) {
		const r = { range: {} }
		r.range[obj.key] = {
			lt: obj.value
		}
		return r
	},
	gt(obj) {
		const r = { range: {} }
		r.range[obj.key] = {
			gt: obj.value
		}
		return r
	},
	if(obj) {
		const query = {
			bool: {
				should: [
					{
						bool: {
							must: this._expand(obj.conds).concat(this._expand(obj.ifTrue))
						},
					},
				]
			}
		}
		if(obj.ifFalse && obj.ifFalse.length) {
			query.bool.should.push({
				bool: {
					must: this._expand(obj.ifFalse)
				}
			})
		} else {
			query.bool.should.push({
				bool: {
					must_not: this._expand(obj.conds)
				}
			})
		}
		return query
	},
	not(obj) {
		return {
			bool: {
				must_not: conversions[obj.args.type](obj.args)
			}
		}
	},
	or(obj) {
		return {
			bool: {
				should: this._expand(obj.tests)
			}
		};
	},
	and(obj) {
		return {
			bool: {
				must: this._expand(obj.tests)
			}
		};
	},
	true(obj) {
		return term(obj.key, true)
	},
	false(obj) {
		return term(obj.key, false)
	},
	// Since there are no undefined fields I just check for nulls.
	// The storing logic should then set the fields to the correct
	// values.
	nil(obj) {
		return term(obj.key, null)
	},
	undefined(obj) {
		return term(obj.key, null)
	},
	null(obj) {
		return term(obj.key, null)
	},
	// This is the only possible way to handle this in elasticsearch.
	// Normally you're not going to need this when running elasticsearch
	// queries.
	propsEqual(obj) {
		return {
			script: {
				script: `doc[val1].value == doc['val2']`,
				params: {
					val1: obj.keys[0],
					val2: obj.keys[1]
				}
			}
		}
	},
	equal(obj) {
		return term(obj.key, obj.value)
	},
	notEqual(obj) {
		return {
			bool: {
				must_not: [
					term(obj.key, obj.value)
				]
			}
		}
	},
	// TODO: I think I need to change the original assert to match this.
	exist(obj) {
		return {
			exists: objOf('field', obj.key)
		}
	}
}

const convert = function() {
	return {
		bool: {
			must: conversions._expand(this.tests)
		}
	}
}

module.exports = convert
