'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = baseRequest;

var _es6Promise = require('es6-promise');

var _fetchPonyfill = require('fetch-ponyfill');

var _fetchPonyfill2 = _interopRequireDefault(_fetchPonyfill);

var _sprintfJs = require('sprintf-js');

var _format_text = require('./format_text');

var _format_text2 = _interopRequireDefault(_format_text);

var _stringify_as_query_param = require('./stringify_as_query_param');

var _stringify_as_query_param2 = _interopRequireDefault(_stringify_as_query_param);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var fetch = (0, _fetchPonyfill2.default)(_es6Promise.Promise);

/**
 * imported from https://github.com/bigchaindb/js-utility-belt/
 *
 * Global fetch wrapper that adds some basic error handling and ease of use enhancements.
 * Considers any non-2xx response as an error.
 *
 * For more information on fetch, see https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch.
 *
 * Expects fetch to already be available (either in a ES6 environment, bundled through webpack, or
 * injected through a polyfill).
 *
 * @param  {string}  url    Url to request. Can be specified as a sprintf format string (see
 *                          https://github.com/alexei/sprintf.js) that will be resolved using
 *                          `config.urlTemplateSpec`.
 * @param  {object}  config Additional configuration, mostly passed to fetch as its 'init' config
 *                          (see https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters).
 * @param  {*}             config.jsonBody        Json payload to the request. Will automatically be
 *                                                JSON.stringify()-ed and override `config.body`.
 * @param  {string|object} config.query           Query parameter to append to the end of the url.
 *                                                If specified as an object, keys will be
 *                                                decamelized into snake case first.
 * @param  {*[]|object}    config.urlTemplateSpec Format spec to use to expand the url (see sprintf).
 * @param  {*}             config.*               All other options are passed through to fetch.
 *
 * @return {Promise}        Promise that will resolve with the response if its status was 2xx;
 *                          otherwise rejects with the response
 */
function baseRequest(url) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var jsonBody = _ref.jsonBody,
        query = _ref.query,
        urlTemplateSpec = _ref.urlTemplateSpec,
        fetchConfig = _objectWithoutProperties(_ref, ['jsonBody', 'query', 'urlTemplateSpec']);

    var expandedUrl = url;

    if (urlTemplateSpec != null) {
        if (Array.isArray(urlTemplateSpec) && urlTemplateSpec.length) {
            // Use vsprintf for the array call signature
            expandedUrl = (0, _sprintfJs.vsprintf)(url, urlTemplateSpec);
        } else if (urlTemplateSpec && (typeof urlTemplateSpec === 'undefined' ? 'undefined' : _typeof(urlTemplateSpec)) === 'object' && Object.keys(urlTemplateSpec).length) {
            expandedUrl = (0, _format_text2.default)(url, urlTemplateSpec);
        } else if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Supplied urlTemplateSpec was not an array or object. Ignoring...');
        }
    }

    if (query != null) {
        if (typeof query === 'string') {
            expandedUrl += query;
        } else if (query && (typeof query === 'undefined' ? 'undefined' : _typeof(query)) === 'object') {
            expandedUrl += (0, _stringify_as_query_param2.default)(query);
        } else if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Supplied query was not a string or object. Ignoring...');
        }
    }

    if (jsonBody != null) {
        fetchConfig.body = JSON.stringify(jsonBody);
    }

    return fetch.fetch(expandedUrl, fetchConfig).then(function (res) {
        // If status is not a 2xx (based on Response.ok), assume it's an error
        // See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
        if (!(res && res.ok)) {
            throw res;
        }
        return res;
    });
}
module.exports = exports['default'];