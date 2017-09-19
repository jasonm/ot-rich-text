const tap = require('tap')
const type = require('../lib/type')
const Delta = require('../lib/Delta')

tap.equal(type.name, 'ot-rich-text')
tap.equal(type.uri, 'https://github.com/Teamwork/ot-rich-text')
tap.equal(type.create, Delta.create)
tap.equal(type.compose, Delta.compose)
tap.equal(type.apply, Delta.compose)
tap.equal(type.transform, Delta.transform)
tap.equal(type.normalize, Delta.normalize)
tap.equal(type.transformCursor, Delta.transformCursor)
tap.equal(type.diffX, Delta.diffX)
