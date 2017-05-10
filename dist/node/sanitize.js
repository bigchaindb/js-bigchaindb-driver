'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = sanitize;

var _includes = require('core-js/library/fn/array/includes');

var _includes2 = _interopRequireDefault(_includes);

var _entries = require('core-js/library/fn/object/entries');

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Abstraction for selectFromObject and omitFromObject for DRYness.
 * Set isInclusion to true if the filter should be for including the filtered items (ie. selecting
 * only them vs omitting only them).
 */
function filterFromObject(obj, filter) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref$isInclusion = _ref.isInclusion,
        isInclusion = _ref$isInclusion === undefined ? true : _ref$isInclusion;

    if (filter && Array.isArray(filter)) {
        return applyFilterOnObject(obj, isInclusion ? function (_, key) {
            return (0, _includes2.default)(filter, key);
        } : function (_, key) {
            return !(0, _includes2.default)(filter, key);
        });
    } else if (filter && typeof filter === 'function') {
        // Flip the filter fn's return if it's for inclusion
        return applyFilterOnObject(obj, isInclusion ? filter : function () {
            return !filter.apply(undefined, arguments);
        });
    } else {
        throw new Error('The given filter is not an array or function. Exclude aborted');
    }
}

/**
 * Returns a filtered copy of the given object's own enumerable properties (no inherited
 * properties), keeping any keys that pass the given filter function.
 */
function applyFilterOnObject(obj, filterFn) {
    if (filterFn == null) {
        return _extends({}, obj);
    }

    var filteredObj = {};
    (0, _entries2.default)(obj).forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            key = _ref3[0],
            val = _ref3[1];

        if (filterFn(val, key)) {
            filteredObj[key] = val;
        }
    });

    return filteredObj;
}

/**
 * Similar to lodash's _.pick(), this returns a copy of the given object's
 * own and inherited enumerable properties, selecting only the keys in
 * the given array or whose value pass the given filter function.
 * @param  {object}         obj    Source object
 * @param  {array|function} filter Array of key names to select or function to invoke per iteration
 * @return {object}                The new object
 */
function selectFromObject(obj, filter) {
    return filterFromObject(obj, filter);
}

/**
 * Glorified selectFromObject. Takes an object and returns a filtered shallow copy that strips out
 * any properties that are falsy (including coercions, ie. undefined, null, '', 0, ...).
 * Does not modify the passed in object.
 *
 * @param  {object} obj      Javascript object
 * @return {object}          Sanitized Javascript object
 */
function sanitize(obj) {
    return selectFromObject(obj, function (val) {
        return !!val;
    });
}
module.exports = exports['default'];