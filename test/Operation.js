const tap = require('tap')
const {
    createInsertText, createInsertOpen, createInsertClose, createInsertEmbed, createRetain, createDelete,
    isInsert, isInsertText, isInsertOpen, isInsertClose, isInsertEmbed, isRetain, isDelete,
    getContent, getNodeName, getAttributes, getLength, copyOperation, validate,
    areOperationsEqual, areAttributesEqual, getAttributesIndex, hasAttributes,
    slice, merge, composeIterators, transformIterators
} = require('../lib/Operation')
const Iterator = require('../lib/Iterator')
const invalidNodeContent = '\uFDD0DIV'
const nodeContent1 = '\uFDD1'
const nodeContent2 = '\uFDD2'

tap.test('basic tests', t => {
    const retain = createRetain(1)
    const del = createDelete(2)
    const insertText = createInsertText('hello', 1, 'user')
    const insertOpen = createInsertOpen(nodeContent1, 1, 'user', 'DIV')
    const insertClose = createInsertClose(nodeContent1, 1, 'user', 'DIV')
    const insertEmbed = createInsertEmbed(nodeContent1, 1, 'user', 'DIV')

    const retainWithAttributes = createRetain(1, ['key', 'value'])
    const insertTextWithAttributes = createInsertText('hello', 1, 'user', ['key', 'value'])
    const insertOpenWithAttributes = createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value'])
    const insertCloseWithAttributes = createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value'])
    const insertEmbedWithAttributes = createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value'])

    t.equal(getContent(retain), 1)
    t.equal(getContent(del), 2)
    t.equal(getContent(insertText), 'hello')
    t.equal(getContent(insertOpen), nodeContent1)
    t.equal(getContent(insertClose), nodeContent1)
    t.equal(getContent(insertEmbed), nodeContent1)

    t.equal(getNodeName(insertOpen), 'DIV')
    t.equal(getNodeName(insertClose), 'DIV')
    t.equal(getNodeName(insertEmbed), 'DIV')

    t.strictSame(getAttributes(retain), [])
    t.strictSame(getAttributes(del), [])
    t.strictSame(getAttributes(insertText), [])
    t.strictSame(getAttributes(insertOpen), [])
    t.strictSame(getAttributes(insertClose), [])
    t.strictSame(getAttributes(insertEmbed), [])

    t.strictSame(getAttributes(retainWithAttributes), ['key', 'value'])
    t.strictSame(getAttributes(insertTextWithAttributes), ['key', 'value'])
    t.strictSame(getAttributes(insertOpenWithAttributes), ['key', 'value'])
    t.strictSame(getAttributes(insertCloseWithAttributes), ['key', 'value'])
    t.strictSame(getAttributes(insertEmbedWithAttributes), ['key', 'value'])
    t.strictSame(
        getAttributes(createRetain(1, [ 'more', 'attributes', 'nullValue', null, 'yet another', 'one' ])),
        [ 'more', 'attributes', 'nullValue', null, 'yet another', 'one' ])

    t.equal(isRetain(retain), true)
    t.equal(isRetain(del), false)
    t.equal(isRetain(insertText), false)
    t.equal(isRetain(insertOpen), false)
    t.equal(isRetain(insertClose), false)
    t.equal(isRetain(insertEmbed), false)

    t.equal(isDelete(retain), false)
    t.equal(isDelete(del), true)
    t.equal(isDelete(insertText), false)
    t.equal(isDelete(insertOpen), false)
    t.equal(isDelete(insertClose), false)
    t.equal(isDelete(insertEmbed), false)

    t.equal(isInsert(retain), false)
    t.equal(isInsert(del), false)
    t.equal(isInsert(insertText), true)
    t.equal(isInsert(insertOpen), true)
    t.equal(isInsert(insertClose), true)
    t.equal(isInsert(insertEmbed), true)

    t.equal(isInsertText(retain), false)
    t.equal(isInsertText(del), false)
    t.equal(isInsertText(insertText), true)
    t.equal(isInsertText(insertOpen), false)
    t.equal(isInsertText(insertClose), false)
    t.equal(isInsertText(insertEmbed), false)

    t.equal(isInsertOpen(retain), false)
    t.equal(isInsertOpen(del), false)
    t.equal(isInsertOpen(insertText), false)
    t.equal(isInsertOpen(insertOpen), true)
    t.equal(isInsertOpen(insertClose), false)
    t.equal(isInsertOpen(insertEmbed), false)

    t.equal(isInsertClose(retain), false)
    t.equal(isInsertClose(del), false)
    t.equal(isInsertClose(insertText), false)
    t.equal(isInsertClose(insertOpen), false)
    t.equal(isInsertClose(insertClose), true)
    t.equal(isInsertClose(insertEmbed), false)

    t.equal(isInsertEmbed(retain), false)
    t.equal(isInsertEmbed(del), false)
    t.equal(isInsertEmbed(insertText), false)
    t.equal(isInsertEmbed(insertOpen), false)
    t.equal(isInsertEmbed(insertClose), false)
    t.equal(isInsertEmbed(insertEmbed), true)

    t.equal(getAttributesIndex(retain), 2)
    t.equal(getAttributesIndex(del), 2)
    t.equal(getAttributesIndex(insertText), 4)
    t.equal(getAttributesIndex(insertOpen), 5)
    t.equal(getAttributesIndex(insertClose), 5)
    t.equal(getAttributesIndex(insertEmbed), 5)

    t.equal(getAttributesIndex(retainWithAttributes), 2)
    t.equal(getAttributesIndex(insertTextWithAttributes), 4)
    t.equal(getAttributesIndex(insertOpenWithAttributes), 5)
    t.equal(getAttributesIndex(insertCloseWithAttributes), 5)
    t.equal(getAttributesIndex(insertEmbedWithAttributes), 5)

    t.equal(hasAttributes(retain), false)
    t.equal(hasAttributes(del), false)
    t.equal(hasAttributes(insertText), false)
    t.equal(hasAttributes(insertOpen), false)
    t.equal(hasAttributes(insertClose), false)
    t.equal(hasAttributes(insertEmbed), false)

    t.equal(hasAttributes(retainWithAttributes), true)
    t.equal(hasAttributes(insertTextWithAttributes), true)
    t.equal(hasAttributes(insertOpenWithAttributes), true)
    t.equal(hasAttributes(insertCloseWithAttributes), true)
    t.equal(hasAttributes(insertEmbedWithAttributes), true)

    t.end()
})

tap.test('copyOperation', t => {
    t.test('with attributes', t => {
        t.strictSame(copyOperation(
            createInsertText('hello', 1, 'user', ['key', 'value']), false),
            createInsertText('hello', 1, 'user', ['key', 'value']))
        t.strictSame(copyOperation(
            createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), false),
            createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.strictSame(copyOperation(
            createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), false),
            createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.strictSame(copyOperation(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), false),
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.strictSame(copyOperation(
            createRetain(5, ['key', 'value']), false),
            createRetain(5, ['key', 'value']))
        t.strictSame(copyOperation(
            createDelete(6), false),
            createDelete(6))
        t.end()
    })

    t.test('without attributes', t => {
        t.strictSame(copyOperation(
            createInsertText('hello', 1, 'user', ['key', 'value']), true),
            createInsertText('hello', 1, 'user'))
        t.strictSame(copyOperation(
            createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), true),
            createInsertOpen(nodeContent1, 1, 'user', 'DIV'))
        t.strictSame(copyOperation(
            createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), true),
            createInsertClose(nodeContent1, 1, 'user', 'DIV'))
        t.strictSame(copyOperation(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), true),
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV'))
        t.strictSame(copyOperation(
            createRetain(5, ['key', 'value']), true),
            createRetain(5))
        t.strictSame(copyOperation(
            createDelete(6), true),
            createDelete(6))
        t.end()
    })

    t.end()
})

tap.test('validate', t => {
    t.test('basic', t => {
        t.type(validate(null), Error, 'not an array: null')
        t.type(validate(undefined), Error, 'not an array: null')
        t.type(validate({ 0: 0, 1: 1, length: 2 }), Error, 'not an array: an object pretending to be a "retain" action')
        t.type(validate(['0', 5]), Error, 'invalid action')
        t.type(validate([-2, 5]), Error, 'unsupported action')
        t.type(validate([ -1 ]), Error, 'too short for delete')
        t.type(validate([ 0 ]), Error, 'too short for retain')
        t.type(validate([ 1, 'a', 0 ]), Error, 'too short for insert text')
        t.type(validate([ 2, 'a', 0, '' ]), Error, 'too short for insert open')
        t.type(validate([ 3, 'a', 0, '' ]), Error, 'too short for insert close')
        t.type(validate([ 4, 'a', 0, '' ]), Error, 'too short for insert embed')
        t.end()
    })

    t.test('delete', t => {
        t.type(validate(createDelete('1')), Error, 'content not a number')
        t.type(validate(createDelete(0)), Error, '0 content')
        t.type(validate(createDelete(-1)), Error, 'negative content')
        t.type(validate(createDelete(1.01)), Error, 'content not int')
        t.type(validate(createDelete(Infinity)), Error, 'content not finite')
        t.type(validate(createDelete(1).concat([1])), Error, 'operation too long')
        t.equal(validate(createDelete(1)), null)
        t.end()
    })

    t.test('retain', t => {
        t.type(validate(createRetain('1')), Error, 'content not a number')
        t.type(validate(createRetain(0)), Error, '0 content')
        t.type(validate(createRetain(-1)), Error, 'negative content')
        t.type(validate(createRetain(1.01)), Error, 'content not int')
        t.type(validate(createRetain(Infinity)), Error, 'content not finite')
        t.type(validate(createRetain(1, [ '1' ])), Error, 'no attribute value')
        t.type(validate(createRetain(1, [ 1, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createRetain(1, [ null, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createRetain(1, [ '1', 1 ])), Error, 'attribute value not a string and not null')
        t.type(validate(createRetain(1, [ 'b', null, 'a', null ])), Error, 'attributes not sorted by name')
        t.type(validate(createRetain(1, [ 'a', null, 'a', null ])), Error, 'duplicate attribute name')
        t.type(validate(createRetain(1, [ 'a', null, 'b', null, 'a', null ])), Error, 'attributes not sorted by name')
        t.equal(validate(createRetain(1)), null)
        t.equal(validate(createRetain(1, [ '1', '1' ])), null)
        t.equal(validate(createRetain(1, [ '1', null ])), null)
        t.equal(validate(createRetain(1, [ '', null, '1', null, 'a', '', 'ab', 'b' ])), null)
        t.equal(validate(createRetain(1, [ 'a', null, 'b', null ])), null)

        t.end()
    })

    t.test('insertText', t => {
        t.type(validate(createInsertText(1, 0, '')), Error, 'content not a string')
        t.type(validate(createInsertText('', 0, '')), Error, 'content empty')
        t.type(validate(createInsertText('a', -1, '')), Error, 'version negative')
        t.type(validate(createInsertText('a', 1.01, '')), Error, 'version not int')
        t.type(validate(createInsertText('a', Infinity, '')), Error, 'version not finite')
        t.type(validate(createInsertText('a', '1', '')), Error, 'version not a number')
        t.type(validate(createInsertText('a', 0, 1)), Error, 'author not a string')
        t.type(validate(createInsertText('a', 0, '', [ '1' ])), Error, 'no attribute value')
        t.type(validate(createInsertText('a', 0, '', [ 1, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertText('a', 0, '', [ null, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertText('a', 0, '', [ '1', 1 ])), Error, 'attribute value not a string')
        t.type(validate(createInsertText('a', 0, '', [ '1', null ])), Error, 'attribute value not a string')
        t.type(validate(createInsertText('a', 0, '', [ 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.type(validate(createInsertText('a', 0, '', [ 'a', '', 'a', '' ])), Error, 'duplicate attribute name')
        t.type(validate(createInsertText('a', 0, '', [ 'a', '', 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.equal(validate(createInsertText('a', 0, '')), null)
        t.equal(validate(createInsertText('a', 0, '', [ '1', '1' ])), null)
        t.equal(validate(createInsertText('a', 0, '', [ '1', '' ])), null)
        t.equal(validate(createInsertText('a', 0, '', [ '', '', '1', '', 'a', '', 'ab', 'b' ])), null)
        t.equal(validate(createInsertText('a', 0, '', [ 'a', '', 'b', '' ])), null)
        t.end()
    })

    t.test('insertOpen', t => {
        t.type(validate(createInsertOpen(1, 0, '', '')), Error, 'content not a string')
        t.type(validate(createInsertOpen('', 0, '', '')), Error, 'content empty')
        t.type(validate(createInsertOpen('aa', 0, '', '')), Error, 'content too long')
        t.type(validate(createInsertOpen(String.fromCharCode(0xFDD0 - 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertOpen(String.fromCharCode(0xFDEF + 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertOpen(nodeContent1, -1, '', '')), Error, 'version negative')
        t.type(validate(createInsertOpen(nodeContent1, 1.01, '', '')), Error, 'version not int')
        t.type(validate(createInsertOpen(nodeContent1, Infinity, '', '')), Error, 'version not finite')
        t.type(validate(createInsertOpen(nodeContent1, '1', '', '')), Error, 'version not a number')
        t.type(validate(createInsertOpen(nodeContent1, 0, 1, '')), Error, 'author not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', 1)), Error, 'nodeName not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ '1' ])), Error, 'no attribute value')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ 1, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ null, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ '1', 1 ])), Error, 'attribute value not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ '1', null ])), Error, 'attribute value not a string')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ 'a', '', 'a', '' ])), Error, 'duplicate attribute name')
        t.type(validate(createInsertOpen(nodeContent1, 0, '', '', [ 'a', '', 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', '')), null)
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', 'DIV')), null)
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', '', [ '1', '1' ])), null)
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', '', [ '1', '' ])), null)
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', '', [ '', '', '1', '', 'a', '', 'ab', 'b' ])), null)
        t.equal(validate(createInsertOpen(nodeContent1, 0, '', '', [ 'a', '', 'b', '' ])), null)
        t.end()
    })

    t.test('insertClose', t => {
        t.type(validate(createInsertClose(1, 0, '', '')), Error, 'content not a string')
        t.type(validate(createInsertClose('', 0, '', '')), Error, 'content empty')
        t.type(validate(createInsertClose('aa', 0, '', '')), Error, 'content too long')
        t.type(validate(createInsertClose(String.fromCharCode(0xFDD0 - 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertClose(String.fromCharCode(0xFDEF + 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertClose(nodeContent1, -1, '', '')), Error, 'version negative')
        t.type(validate(createInsertClose(nodeContent1, 1.01, '', '')), Error, 'version not int')
        t.type(validate(createInsertClose(nodeContent1, Infinity, '', '')), Error, 'version not finite')
        t.type(validate(createInsertClose(nodeContent1, '1', '', '')), Error, 'version not a number')
        t.type(validate(createInsertClose(nodeContent1, 0, 1, '')), Error, 'author not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', 1)), Error, 'nodeName not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ '1' ])), Error, 'no attribute value')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ 1, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ null, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ '1', 1 ])), Error, 'attribute value not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ '1', null ])), Error, 'attribute value not a string')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ 'a', '', 'a', '' ])), Error, 'duplicate attribute name')
        t.type(validate(createInsertClose(nodeContent1, 0, '', '', [ 'a', '', 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.equal(validate(createInsertClose(nodeContent1, 0, '', '')), null)
        t.equal(validate(createInsertClose(nodeContent1, 0, '', 'DIV')), null)
        t.equal(validate(createInsertClose(nodeContent1, 0, '', '', [ '1', '1' ])), null)
        t.equal(validate(createInsertClose(nodeContent1, 0, '', '', [ '1', '' ])), null)
        t.equal(validate(createInsertClose(nodeContent1, 0, '', '', [ '', '', '1', '', 'a', '', 'ab', 'b' ])), null)
        t.equal(validate(createInsertClose(nodeContent1, 0, '', '', [ 'a', '', 'b', '' ])), null)
        t.end()
    })

    t.test('insertEmbed', t => {
        t.type(validate(createInsertEmbed(1, 0, '', '')), Error, 'content not a string')
        t.type(validate(createInsertEmbed('', 0, '', '')), Error, 'content empty')
        t.type(validate(createInsertEmbed('aa', 0, '', '')), Error, 'content too long')
        t.type(validate(createInsertEmbed(String.fromCharCode(0xFDD0 - 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertEmbed(String.fromCharCode(0xFDEF + 1), 0, '', '')), Error, 'invalid node id')
        t.type(validate(createInsertEmbed(nodeContent1, -1, '', '')), Error, 'version negative')
        t.type(validate(createInsertEmbed(nodeContent1, 1.01, '', '')), Error, 'version not int')
        t.type(validate(createInsertEmbed(nodeContent1, Infinity, '', '')), Error, 'version not finite')
        t.type(validate(createInsertEmbed(nodeContent1, '1', '', '')), Error, 'version not a number')
        t.type(validate(createInsertEmbed(nodeContent1, 0, 1, '')), Error, 'author not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', 1)), Error, 'nodeName not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '1' ])), Error, 'no attribute value')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ 1, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ null, '1' ])), Error, 'attribute name not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '1', 1 ])), Error, 'attribute value not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '1', null ])), Error, 'attribute value not a string')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ 'a', '', 'a', '' ])), Error, 'duplicate attribute name')
        t.type(validate(createInsertEmbed(nodeContent1, 0, '', '', [ 'a', '', 'b', '', 'a', '' ])), Error, 'attributes not sorted by name')
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', '')), null)
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', 'DIV')), null)
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '1', '1' ])), null)
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '1', '' ])), null)
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', '', [ '', '', '1', '', 'a', '', 'ab', 'b' ])), null)
        t.equal(validate(createInsertEmbed(nodeContent1, 0, '', '', [ 'a', '', 'b', '' ])), null)
        t.end()
    })

    t.end()
})

tap.test('areOperationsEqual', t => {
    t.equal(areOperationsEqual(
        createInsertText('a', 1, 'user', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertText('a', 1, 'user', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), true)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), true)
    t.equal(areOperationsEqual(
        createInsertClose(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertClose(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), true)
    t.equal(areOperationsEqual(
        createInsertEmbed(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertEmbed(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), true)
    t.equal(areOperationsEqual(
        createRetain(5, [ 'key1', 'value1', 'key2', 'value2' ] ),
        createRetain(5, [ 'key1', 'value1', 'key2', 'value2' ] )
    ), true)
    t.equal(areOperationsEqual(
        createDelete(5),
        createDelete(5)
    ), true)
    t.equal(areOperationsEqual(
        createDelete(5),
        createRetain(5)
    ), false)
    t.equal(areOperationsEqual(
        createDelete(5),
        createDelete(6)
    ), false)
    t.equal(areOperationsEqual(
        createRetain(5, [ 'key1', 'value1' ] ),
        createRetain(5, [ 'key1', 'value1', 'key2', 'value2' ] )
    ), false)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent2, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), false)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent1, 2, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), false)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent1, 1, 'user2', 'P', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), false)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent1, 1, 'user', 'DIV', [ 'key1', 'value1', 'key2', 'value2' ] )
    ), false)
    t.equal(areOperationsEqual(
        createInsertOpen(nodeContent1, 1, 'user', 'P', [ 'key1', 'value1', 'key2', 'value2' ] ),
        createInsertOpen(nodeContent1, 2, 'user', 'P', [ 'key1', 'value1', 'key2', 'value3' ] )
    ), false)
    t.end()
})

tap.test('areAttributesEqual', t => {
    t.test('insertText', t => {
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user'),
            createInsertText('b', 1, 'user')
        ), true)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user', ['key', 'value']),
            createInsertText('b', 1, 'user', ['key', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user', ['key', 'value', 'key2', null]),
            createInsertText('b', 1, 'user', ['key', 'value', 'key2', null])
        ), true)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user', ['key', 'value']),
            createInsertText('b', 1, 'user')
        ), false)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user'),
            createInsertText('b', 1, 'user', ['key', 'value'])
        ), false)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user', ['key', 'value1']),
            createInsertText('b', 1, 'user', ['key', 'value2'])
        ), false)
        t.equal(areAttributesEqual(
            createInsertText('a', 1, 'user', ['key1', 'value']),
            createInsertText('b', 1, 'user', ['key2', 'value'])
        ), false)
        t.end()
    })
    t.test('retain', t => {
        t.equal(areAttributesEqual(
            createRetain(1),
            createRetain(2)
        ), true)
        t.equal(areAttributesEqual(
            createRetain(1, ['key', 'value']),
            createRetain(2, ['key', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createRetain(1, ['key', 'value', 'key2', null]),
            createRetain(2, ['key', 'value', 'key2', null])
        ), true)
        t.equal(areAttributesEqual(
            createRetain(1, ['key', 'value']),
            createRetain(2)
        ), false)
        t.equal(areAttributesEqual(
            createRetain(1),
            createRetain(2, ['key', 'value'])
        ), false)
        t.equal(areAttributesEqual(
            createRetain(1, ['key', 'value1']),
            createRetain(2, ['key', 'value2'])
        ), false)
        t.equal(areAttributesEqual(
            createRetain(1, ['key1', 'value']),
            createRetain(2, ['key2', 'value'])
        ), false)
        t.end()
    })
    t.test('insertEmbed', t => {
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV'),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV')
        ), true)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value', 'key2', null]),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key', 'value', 'key2', null])
        ), true)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV')
        ), false)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV'),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key', 'value'])
        ), false)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value1']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key', 'value2'])
        ), false)
        t.equal(areAttributesEqual(
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key1', 'value']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key2', 'value'])
        ), false)
        t.end()
    })
    t.test('mix', t => {
        t.equal(areAttributesEqual(
            createInsertText('hello', 1, 'user', ['key1', 'value']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key1', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createInsertText('hello', 1, 'user', ['key1', 'value']),
            createRetain(2, ['key1', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createRetain(5, ['key1', 'value']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key1', 'value'])
        ), true)
        t.equal(areAttributesEqual(
            createInsertText('hello', 1, 'user', ['key1', 'value1']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key1', 'value2'])
        ), false)
        t.equal(areAttributesEqual(
            createInsertText('hello', 1, 'user', ['key1', 'value1']),
            createRetain(2, ['key1', 'value2'])
        ), false)
        t.equal(areAttributesEqual(
            createRetain(5, ['key1', 'value1']),
            createInsertEmbed(nodeContent2, 1, 'user', 'DIV', ['key1', 'value2'])
        ), false)
        t.end()
    })
    t.end()
})

tap.test('getLength', t => {
    t.equal(getLength(createInsertText('hello', 1, 'user')), 5)
    t.equal(getLength(createInsertOpen(nodeContent1, 1, 'user', 'DIV')), 1)
    t.equal(getLength(createInsertClose(nodeContent1, 1, 'user', 'DIV')), 1)
    t.equal(getLength(createInsertEmbed(nodeContent1, 1, 'user', 'DIV')), 1)
    t.equal(getLength(createRetain(5)), 5)
    t.equal(getLength(createDelete(5)), 5)

    t.equal(getLength(createInsertText('', 1, 'user')), 0)
    t.equal(getLength(createInsertOpen('', 1, 'user', 'DIV')), 0)
    t.equal(getLength(createInsertOpen(invalidNodeContent, 1, 'user', 'DIV')), invalidNodeContent.length)
    t.equal(getLength(createInsertClose('', 1, 'user', 'DIV')), 0)
    t.equal(getLength(createInsertClose(invalidNodeContent, 1, 'user', 'DIV')), invalidNodeContent.length)
    t.equal(getLength(createInsertEmbed('', 1, 'user', 'DIV')), 0)
    t.equal(getLength(createInsertEmbed(invalidNodeContent, 1, 'user', 'DIV')), invalidNodeContent.length)
    t.equal(getLength(createRetain(0)), 0)
    t.equal(getLength(createRetain(-1)), -1)
    t.equal(getLength(createDelete(0)), 0)
    t.equal(getLength(createDelete(-1)), -1)

    t.end()
})

tap.test('merge', t => {
    t.strictSame(merge(createRetain(2), createRetain(5)), createRetain(7))
    t.strictSame(merge(createRetain(0), createRetain(0)), createRetain(0))
    t.strictSame(merge(createDelete(3), createDelete(8)), createDelete(11))
    t.strictSame(merge(createDelete(3), createDelete(8)), createDelete(11, 5, 'user'))
    t.strictSame(merge(
        createInsertText('Hello', 1, 'user'),
        createInsertText(' World', 1, 'user')),
        createInsertText('Hello World', 1, 'user'))
    t.strictSame(merge(
        createInsertText('Hello', 1, 'user', ['attributeName', 'attributeValue']),
        createInsertText(' World', 1, 'user', ['attributeName', 'attributeValue'])),
        createInsertText('Hello World', 1, 'user', ['attributeName', 'attributeValue']))

    t.equal(merge(createRetain(1), createDelete(1)), null, 'Different actions')
    t.equal(merge(createInsertOpen(nodeContent1, 1, 'user', 'DIV'), createInsertClose(nodeContent1, 1, 'user', 'DIV')), null, 'Different insert actions')
    t.equal(merge(createInsertOpen(nodeContent1, 1, 'user', 'DIV'), createInsertOpen(nodeContent1, 1, 'user', 'DIV')), null, 'Insert open')
    t.equal(merge(createInsertClose(nodeContent1, 1, 'user', 'DIV'), createInsertClose(nodeContent1, 1, 'user', 'DIV')), null, 'Insert close')
    t.equal(merge(createInsertEmbed(nodeContent1, 1, 'user', 'DIV'), createInsertEmbed(nodeContent1, 1, 'user', 'DIV')), null, 'Insert embed')
    t.equal(
        merge(
            createInsertText('hello', 1, 'user', ['attributeName', 'attributeValue']),
            createInsertText('hello', 1, 'user')
        ),
        null,
        'Different attribute lengths')
    t.equal(
        merge(
            createInsertText('hello', 1, 'user', ['attributeName', 'attributeValue1']),
            createInsertText('hello', 1, 'user', ['attributeName', 'attributeValue2'])
        ),
        null,
        'Different attributes')

    t.end()
})

tap.test('slice', t => {

    t.test('retain', t => {
        t.strictSame(
            slice(createRetain(5, ['key', 'value']), 0, 5, 5),
            createRetain(5, ['key', 'value']))
        t.strictSame(
            slice(createRetain(5, ['key', 'value']), 0, 2, 5),
            createRetain(2, ['key', 'value']))
        t.strictSame(
            slice(createRetain(5, ['key', 'value']), 1, 2, 5),
            createRetain(2, ['key', 'value']))
        t.strictSame(
            slice(createRetain(5, ['key', 'value']), 2, 3, 5),
            createRetain(3, ['key', 'value']))
        t.end()
    })

    t.test('delete', t => {
        t.strictSame(
            slice(createDelete(5), 0, 5, 5),
            createDelete(5))
        t.strictSame(
            slice(createDelete(5), 0, 2, 5),
            createDelete(2))
        t.strictSame(
            slice(createDelete(5), 1, 2, 5),
            createDelete(2))
        t.strictSame(
            slice(createDelete(5), 2, 3, 5),
            createDelete(3))
        t.end()
    })

    t.test('insert text', t => {
        t.strictSame(
            slice(createInsertText('hello', 1, 'user', ['key', 'value']), 0, 5, 5),
            createInsertText('hello', 1, 'user', ['key', 'value']))
        t.strictSame(
            slice(createInsertText('hello', 1, 'user', ['key', 'value']), 0, 2, 5),
            createInsertText('he', 1, 'user', ['key', 'value']))
        t.strictSame(
            slice(createInsertText('hello', 1, 'user', ['key', 'value']), 1, 2, 5),
            createInsertText('el', 1, 'user', ['key', 'value']))
        t.strictSame(
            slice(createInsertText('hello', 1, 'user', ['key', 'value']), 2, 3, 5),
            createInsertText('llo', 1, 'user', ['key', 'value']))
        t.end()
    })

    t.test('insert open', t => {
        t.strictSame(
            slice(createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), 0, 1, 1),
            createInsertOpen(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.end()
    })

    t.test('insert close', t => {
        t.strictSame(
            slice(createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), 0, 1, 1),
            createInsertClose(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.end()
    })

    t.test('insert embed', t => {
        t.strictSame(
            slice(createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']), 0, 1, 1),
            createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value']))
        t.end()
    })

    t.end()
})

tap.test('composeIterators', t => {
    t.test('iterator1 and iterator2 empty', t => {
        const i1 = new Iterator([])
        const i2 = new Iterator([])
        const composedOperation = null

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 empty', t => {
        const i1 = new Iterator([])
        const i2 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
        const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator2 empty', t => {
        const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([])
        const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 delete, iterator2 insert', t => {
        const i1 = new Iterator([ createDelete(5) ]).next(1)
        const i2 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
        const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 1)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 delete, iterator2 retain', t => {
        const i1 = new Iterator([ createDelete(5) ]).next(1)
        const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(1)
        const composedOperation = createDelete(4)

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 1)
        t.end()
    })

    t.test('iterator1 retain (with attributes), iterator2 retain (no attributes)', t => {
        const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createRetain(9) ]).next(2)
        const composedOperation = createRetain(4, ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 6)
        t.end()
    })

    t.test('iterator1 retain (with attributes), iterator2 retain (the same atrributes)', t => {
        const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
        const composedOperation = createRetain(4, ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 6)
        t.end()
    })

    t.test('iterator1 retain (no attributes), iterator2 retain (with attributes)', t => {
        const i1 = new Iterator([ createRetain(5) ]).next(1)
        const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
        const composedOperation = createRetain(4, ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 6)
        t.end()
    })

    t.test('iterator1 insert text (no attributes), iterator2 retain (with attributes)', t => {
        const i1 = new Iterator([ createInsertText('hello', 1, 'user') ]).next(1)
        const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
        const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 6)
        t.end()
    })

    t.test('iterator1 insert text (no attributes), iterator2 retain (with attributes)', t => {
        const i1 = new Iterator([ createInsertText('hello', 1, 'user') ]).next(1)
        const i2 = new Iterator([ createRetain(4, ['key', 'value']) ]).next(2)
        const composedOperation = createInsertText('el', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 3)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 insert embed (no attributes), iterator2 retain (with attributes)', t => {
        const i1 = new Iterator([ createInsertEmbed(nodeContent1, 1, 'user', 'DIV') ])
        const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
        const composedOperation = createInsertEmbed(nodeContent1, 1, 'user', 'DIV', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 3)
        t.end()
    })

    t.test('attributes (retain+retain)', t => {
        t.test('iterator1 retain (with attributes), iterator2 retain (extra atrributes at start)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['anotherKey', 'anotherValue', 'key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['anotherKey', 'anotherValue', 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (with attributes), iterator2 retain (extra atrributes at end)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value', 'z-anotherKey', 'anotherValue']) ]).next(2)
            const composedOperation = createRetain(4, ['key', 'value', 'z-anotherKey', 'anotherValue'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (extra attributes at start), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createRetain(5, ['anotherKey', 'anotherValue', 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['anotherKey', 'anotherValue', 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (with attributes at end), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value', 'z-anotherKey', 'anotherValue']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['key', 'value', 'z-anotherKey', 'anotherValue'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (with attributes), iterator2 retain (extra null atrributes at start)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['anotherKey', null, 'key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['anotherKey', null, 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (with attributes), iterator2 retain (extra null atrributes at end)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value', 'z-anotherKey', null]) ]).next(2)
            const composedOperation = createRetain(4, ['key', 'value', 'z-anotherKey', null])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (extra null attributes at start), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createRetain(5, ['anotherKey', null, 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['anotherKey', null, 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (extra null attributes at end), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value', 'z-anotherKey', null]) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createRetain(4, ['key', 'value', 'z-anotherKey', null])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 retain (with attributes), iterator2 retain (with null atrributes)', t => {
            const i1 = new Iterator([ createRetain(5, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', null]) ]).next(2)
            const composedOperation = createRetain(4, ['key', null])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.end()
    })

    t.test('attributes (insert+retain)', t => {
        t.test('iterator1 insert (with attributes), iterator2 retain (extra atrributes at start)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['anotherKey', 'anotherValue', 'key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['anotherKey', 'anotherValue', 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (with attributes), iterator2 retain (extra atrributes at end)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value', 'z-anotherKey', 'anotherValue']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value', 'z-anotherKey', 'anotherValue'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (extra attributes at start), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['anotherKey', 'anotherValue', 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['anotherKey', 'anotherValue', 'key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (with attributes at end), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value', 'z-anotherKey', 'anotherValue']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value', 'z-anotherKey', 'anotherValue'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (with attributes), iterator2 retain (extra null atrributes at start)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['anotherKey', null, 'key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (with attributes), iterator2 retain (extra null atrributes at end)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value', 'z-anotherKey', null]) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (extra null attributes at start), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['anotherKey', null, 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (extra null attributes at end), iterator2 retain (with atrributes)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value', 'z-anotherKey', null]) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', 'value']) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user', ['key', 'value'])

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.test('iterator1 insert (with attributes), iterator2 retain (with null atrributes)', t => {
            const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(9, ['key', null]) ]).next(2)
            const composedOperation = createInsertText('ello', 1, 'user')

            t.strictSame(composeIterators(i1, i2), composedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 6)
            t.end()
        })
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (longer operation)', t => {
        const i1 = new Iterator([ createRetain(5) ]).next(1)
        const i2 = new Iterator([ createDelete(8) ]).next(2)
        const composedOperation = createDelete(4)

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 6)
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (shorter operation)', t => {
        const i1 = new Iterator([ createRetain(5) ]).next(1)
        const i2 = new Iterator([ createDelete(3) ]).next(1)
        const composedOperation = createDelete(2)

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 3)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 insert, iterator2 delete (longer operation)', t => {
        const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createDelete(8) ]).next(1)
        const composedOperation = createDelete(3)

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 insert, iterator2 delete (shorter operation)', t => {
        const i1 = new Iterator([ createInsertText('hello', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createDelete(3) ]).next(1)
        const composedOperation = createInsertText('lo', 1, 'user', ['key', 'value'])

        t.strictSame(composeIterators(i1, i2), composedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.end()
})

tap.test('transformIterators', t => {
    t.test('iterator1 insert, iterator2 insert (priority: left)', t => {
        const i1 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createInsertText('xyz', 1, 'user', ['key', 'value']) ]).next(1)
        const transformedOperation = createInsertText('bc', 1, 'user', ['key', 'value'])

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 1)
        t.end()
    })

    t.test('iterator1 insert, iterator2 insert (priority: right)', t => {
        const i1 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createInsertText('xyz', 1, 'user', ['key', 'value']) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 1)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 insert, iterator2 retain (priority: left)', t => {
        const i1 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
        const transformedOperation = createInsertText('bc', 1, 'user', ['key', 'value'])

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 1)
        t.end()
    })

    t.test('iterator1 insert, iterator2 retain (priority: right)', t => {
        const i1 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const i2 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
        const transformedOperation = createInsertText('bc', 1, 'user', ['key', 'value'])

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 1)
        t.end()
    })

    t.test('iterator1 delete, iterator2 insert (priority: left)', t => {
        const i1 = new Iterator([ createDelete(5) ]).next(1)
        const i2 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 1)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 delete, iterator2 insert (priority: right)', t => {
        const i1 = new Iterator([ createDelete(5) ]).next(1)
        const i2 = new Iterator([ createInsertText('abc', 1, 'user', ['key', 'value']) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 1)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (priority: left)', t => {
        const i1 = new Iterator([ createRetain(5) ]).next(1)
        const i2 = new Iterator([ createDelete(8) ]).next(1)
        const transformedOperation = null

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 5)
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (priority: right)', t => {
        const i1 = new Iterator([ createRetain(5) ]).next(1)
        const i2 = new Iterator([ createDelete(8) ]).next(1)
        const transformedOperation = null

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 5)
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (priority: left)', t => {
        const i1 = new Iterator([ createRetain(6) ]).next(1)
        const i2 = new Iterator([ createDelete(4) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 retain, iterator2 delete (priority: right)', t => {
        const i1 = new Iterator([ createRetain(6) ]).next(1)
        const i2 = new Iterator([ createDelete(4) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 delete, iterator2 retain (priority: left)', t => {
        const i1 = new Iterator([ createDelete(4) ]).next(1)
        const i2 = new Iterator([ createRetain(6) ]).next(1)
        const transformedOperation = createDelete(3)

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 4)
        t.end()
    })

    t.test('iterator1 delete, iterator2 retain (priority: right)', t => {
        const i1 = new Iterator([ createDelete(4) ]).next(1)
        const i2 = new Iterator([ createRetain(3) ]).next(1)
        const transformedOperation = createDelete(2)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 3)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 retain, iterator2 retain (priority: left)', t => {
        const i1 = new Iterator([ createRetain(4) ]).next(1)
        const i2 = new Iterator([ createRetain(6) ]).next(1)
        const transformedOperation = createRetain(3)

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 4)
        t.end()
    })

    t.test('iterator1 retain, iterator2 retain (priority: right)', t => {
        const i1 = new Iterator([ createRetain(4) ]).next(1)
        const i2 = new Iterator([ createRetain(6) ]).next(1)
        const transformedOperation = createRetain(3)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 1)
        t.equal(i1.offset, 0)
        t.equal(i2.index, 0)
        t.equal(i2.offset, 4)
        t.end()
    })

    t.test('iterator1 retain, iterator2 retain (priority: left)', t => {
        const i1 = new Iterator([ createRetain(4) ]).next(1)
        const i2 = new Iterator([ createRetain(3) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, true), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 3)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 retain, iterator2 retain (priority: right)', t => {
        const i1 = new Iterator([ createRetain(4) ]).next(1)
        const i2 = new Iterator([ createRetain(3) ]).next(1)
        const transformedOperation = createRetain(2)

        t.strictSame(transformIterators(i1, i2, false), transformedOperation)
        t.equal(i1.index, 0)
        t.equal(i1.offset, 3)
        t.equal(i2.index, 1)
        t.equal(i2.offset, 0)
        t.end()
    })

    t.test('iterator1 retain, iterator2 retain (attributes)', t => {
        t.test('an attribute <-> the same attribute (priority: left)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['key', 'value'])

            t.strictSame(transformIterators(i1, i2, true), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('an attribute <-> the same attribute (priority: right)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1)

            t.strictSame(transformIterators(i1, i2, false), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('an attribute <-> extra attribute at end (priority: left)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value', 'z key', 'z value']) ]).next(1)
            const transformedOperation = createRetain(1, ['key', 'value'])

            t.strictSame(transformIterators(i1, i2, true), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('an attribute <-> extra attribute at end (priority: right)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value', 'z key', 'z value']) ]).next(1)
            const transformedOperation = createRetain(1)

            t.strictSame(transformIterators(i1, i2, false), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('an attribute <-> extra attribute at start (priority: left)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['a key', 'a value', 'key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['key', 'value'])

            t.strictSame(transformIterators(i1, i2, true), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('an attribute <-> extra attribute at start (priority: right)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['a key', 'a value', 'key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1)

            t.strictSame(transformIterators(i1, i2, false), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('extra attribute at end <-> an attribute (priority: left)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value', 'z key', 'z value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['key', 'value', 'z key', 'z value'])

            t.strictSame(transformIterators(i1, i2, true), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('extra attribute at end <-> an attribute (priority: right)', t => {
            const i1 = new Iterator([ createRetain(2, ['key', 'value', 'z key', 'z value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['z key', 'z value'])

            t.strictSame(transformIterators(i1, i2, false), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('extra attribute at start <-> an attribute (priority: left)', t => {
            const i1 = new Iterator([ createRetain(2, ['a key', 'a value', 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['a key', 'a value', 'key', 'value'])

            t.strictSame(transformIterators(i1, i2, true), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.test('extra attribute at start <-> an attribute (priority: right)', t => {
            const i1 = new Iterator([ createRetain(2, ['a key', 'a value', 'key', 'value']) ]).next(1)
            const i2 = new Iterator([ createRetain(3, ['key', 'value']) ]).next(1)
            const transformedOperation = createRetain(1, ['a key', 'a value'])

            t.strictSame(transformIterators(i1, i2, false), transformedOperation)
            t.equal(i1.index, 1)
            t.equal(i1.offset, 0)
            t.equal(i2.index, 0)
            t.equal(i2.offset, 2)
            t.end()
        })

        t.end()
    })

    t.end()
})
