'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = request;

var _baseRequest = require('./baseRequest');

var _baseRequest2 = _interopRequireDefault(_baseRequest);

var _sanitize = require('./sanitize');

var _sanitize2 = _interopRequireDefault(_sanitize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_REQUEST_CONFIG = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json'
    }
};

/**
 * Small wrapper around js-utility-belt's request that provides url resolving,
 * default settings, and response handling.
 */
function request(url) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var onlyJsonResponse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    // Load default fetch configuration and remove any falsy query parameters
    var requestConfig = _extends({}, DEFAULT_REQUEST_CONFIG, config, {
        query: config.query && (0, _sanitize2.default)(config.query)
    });
    var apiUrl = url;

    if (requestConfig.jsonBody) {
        requestConfig.headers = _extends({}, requestConfig.headers, {
            'Content-Type': 'application/json'
        });
    }
    if (!url) {
        return Promise.reject(new Error('Request was not given a url.'));
    }

    return (0, _baseRequest2.default)(apiUrl, requestConfig).then(function (res) {
        return onlyJsonResponse ? res.json() : {
            json: res.json(),
            url: res.url
        };
    }).catch(function (err) {
        console.error(err);
        throw err;
    });
}
module.exports = exports['default'];