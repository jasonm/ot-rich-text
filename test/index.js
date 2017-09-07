const tap = require('tap')
const index = require('../index')
const type = require('../lib/type')
const Operation = require('../lib/Operation')
const Iterator = require('../lib/Iterator')

tap.equal(index.type, type)
tap.equal(index.Operation, Operation)
tap.equal(index.Iterator, Iterator)
