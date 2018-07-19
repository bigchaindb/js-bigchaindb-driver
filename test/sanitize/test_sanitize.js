import test from 'ava'
import rewire from 'rewire'

const sanitize = rewire('../../src/sanitize.js')
const applyFilterOnObject = sanitize.__get__('applyFilterOnObject')
const filterFromObject = sanitize.__get__('filterFromObject')


test('Ensure that null filter returns same object', t => {
    const expected = { 'testObj': 'test' }
    const actual = applyFilterOnObject({ 'testObj': 'test' }, null)

    t.deepEqual(actual, expected)
})


test('Ensure function filter with isInclusion true works properly', t => {
    const testObj = [true, false, undefined, '', 0, null]
    const expected = { 0: true }
    const actual = filterFromObject(testObj, (val) => !!val, { isInclusion: true })

    t.deepEqual(actual, expected)
})


test('Ensure function filter with isInclusion false works properly', t => {
    const testObj = [false, true, 1, 10, 'this will be removed as it is truthy']
    const expected = { 0: false }
    const actual = filterFromObject(testObj, (val) => !!val, { isInclusion: false })

    t.deepEqual(actual, expected)
})


test('Ensure array filter with isInclusion true works properly', t => {
    const testObj = [true, false, undefined, '', 0, null]
    const expected = { 0: true }
    const actual = filterFromObject(testObj, [true], { isInclusion: true })

    t.deepEqual(actual, expected)
})


test('Ensure array filter with isInclusion false works properly', t => {
    const testObj = [false, true, 1, 10]
    const expected = { 0: false }
    const actual = filterFromObject(testObj, [true, 1, 10], { isInclusion: false })

    t.deepEqual(actual, expected)
})


test('Ensure throws error when given invalid filter', t => {
    const error = t.throws(() => {
        filterFromObject({}, 'lol')
    }, Error)

    t.is(error.message, 'The given filter is not an array or function. Filter aborted')
})

