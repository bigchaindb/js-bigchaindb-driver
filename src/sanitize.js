import coreIncludes from 'core-js/library/fn/array/includes'
import coreObjectEntries from 'core-js/library/fn/object/entries'


/**
 * @private
 * Abstraction for selectFromObject and omitFromObject for DRYness.
 * Set isInclusion to true if the filter should be for including the filtered items (ie. selecting
 * only them vs omitting only them).
 */
function filterFromObject(obj, filter, { isInclusion = true } = {}) {
    if (filter && Array.isArray(filter)) {
        return applyFilterOnObject(obj, isInclusion ? ((_, key) => coreIncludes(filter, key))
            : ((_, key) => !coreIncludes(filter, key)))
    } else if (filter && typeof filter === 'function') {
        // Flip the filter fn's return if it's for inclusion
        return applyFilterOnObject(obj, isInclusion ? filter
            : (...args) => !filter(...args))
    } else {
        throw new Error('The given filter is not an array or function. Exclude aborted')
    }
}

/**
 * @private
 * Returns a filtered copy of the given object's own enumerable properties (no inherited
 * properties), keeping any keys that pass the given filter function.
 */
function applyFilterOnObject(obj, filterFn) {
    if (filterFn == null) {
        return Object.assign({}, obj)
    }

    const filteredObj = {}
    coreObjectEntries(obj).forEach(([key, val]) => {
        if (filterFn(val, key)) {
            filteredObj[key] = val
        }
    })

    return filteredObj
}

/**
 * @private
 * Similar to lodash's _.pick(), this returns a copy of the given object's
 * own and inherited enumerable properties, selecting only the keys in
 * the given array or whose value pass the given filter function.
 * @param {Object} obj Source object
 * @param {Array|function} filter Array of key names to select or function to invoke per iteration
 * @return {Object} The new object
 */
function selectFromObject(obj, filter) {
    return filterFromObject(obj, filter)
}

/**
 * @private
 * Glorified selectFromObject. Takes an object and returns a filtered shallow copy that strips out
 * any properties that are falsy (including coercions, ie. undefined, null, '', 0, ...).
 * Does not modify the passed in object.
 *
 * @param {Object} obj Javascript object
 * @return {Object} Sanitized Javascript object
 */
export default function sanitize(obj) {
    return selectFromObject(obj, (val) => !!val)
}
