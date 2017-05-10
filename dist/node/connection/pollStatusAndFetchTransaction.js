'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tx_id, API_PATH) {
    return new Promise(function (resolve, reject) {
        var timer = setInterval(function () {
            (0, _getStatus2.default)(tx_id, API_PATH).then(function (res) {
                console.log('Fetched transaction status:', res);
                if (res.status === 'valid') {
                    clearInterval(timer);
                    (0, _getTransaction2.default)(tx_id, API_PATH).then(function (res) {
                        console.log('Fetched transaction:', res);
                        resolve(res);
                    });
                }
            }).catch(function (err) {
                clearInterval(timer);
                reject(err);
            });
        }, 500);
    });
};

var _getTransaction = require('./getTransaction');

var _getTransaction2 = _interopRequireDefault(_getTransaction);

var _getStatus = require('./getStatus');

var _getStatus2 = _interopRequireDefault(_getStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/**
 * @public
 * @param tx_id
 * @param API_PATH
 * @return {Promise}
 */