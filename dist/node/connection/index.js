'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Connection = function () {
    function Connection(path, headers) {
        _classCallCheck(this, Connection);

        this.path = path;
        this.headers = headers;
    }

    _createClass(Connection, [{
        key: 'getApiUrls',
        value: function getApiUrls(endpoints) {
            return {
                'blocks': this.path + 'blocks',
                'blocks_detail': this.path + 'blocks/%(blockId)s',
                'outputs': this.path + 'outputs',
                'statuses': this.path + 'statuses',
                'transactions': this.path + 'transactions',
                'transactions_detail': this.path + 'transactions/%(txId)s',
                'votes': this.path + 'votes'
            }[endpoints];
        }
    }, {
        key: 'req',
        value: function req(path) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            // NOTE: `options.headers` could be undefined, but that's OK.
            options.headers = _extends({}, options.headers, this.headers);
            return (0, _request2.default)(path, options);
        }

        /**
         * @public
         * @param blockId
         */

    }, {
        key: 'getBlock',
        value: function getBlock(blockId) {
            return this.req(this.getApiUrls('blocks_detail'), {
                urlTemplateSpec: {
                    blockId: blockId
                }
            });
        }

        /**
         * @public
         * @param tx_id
         */

    }, {
        key: 'getStatus',
        value: function getStatus(tx_id) {
            return this.req(this.getApiUrls('statuses'), {
                query: {
                    tx_id: tx_id
                }
            });
        }

        /**
         * @public
         * @param txId
         */

    }, {
        key: 'getTransaction',
        value: function getTransaction(txId) {
            return this.req(this.getApiUrls('transactions_detail'), {
                urlTemplateSpec: {
                    txId: txId
                }
            });
        }

        /**
         * @public
         * @param tx_id
         * @param status
         */

    }, {
        key: 'listBlocks',
        value: function listBlocks(_ref) {
            var tx_id = _ref.tx_id,
                status = _ref.status;

            return this.req(this.getApiUrls('blocks'), {
                query: {
                    tx_id: tx_id,
                    status: status
                }
            });
        }

        /**
         * @public
         * @param public_key
         * @param unspent
         * @param onlyJsonResponse
         */

    }, {
        key: 'listOutputs',
        value: function listOutputs(_ref2) {
            var public_key = _ref2.public_key,
                unspent = _ref2.unspent;
            var onlyJsonResponse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return this.req(this.getApiUrls('outputs'), {
                query: {
                    public_key: public_key,
                    unspent: unspent
                }
            }, onlyJsonResponse);
        }

        /**
         * @public
         * @param asset_id
         * @param operation
         */

    }, {
        key: 'listTransactions',
        value: function listTransactions(_ref3) {
            var asset_id = _ref3.asset_id,
                operation = _ref3.operation;

            return this.req(this.getApiUrls('transactions'), {
                query: {
                    asset_id: asset_id,
                    operation: operation
                }
            });
        }

        /**
         * @public
         * @param block_id
         */

    }, {
        key: 'listVotes',
        value: function listVotes(block_id) {
            return this.req(this.getApiUrls('votes'), {
                query: {
                    block_id: block_id
                }
            });
        }

        /**
         * @public
         * @param tx_id
         * @return {Promise}
         */

    }, {
        key: 'pollStatusAndFetchTransaction',
        value: function pollStatusAndFetchTransaction(tx_id) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var timer = setInterval(function () {
                    _this.getStatus(tx_id).then(function (res) {
                        console.log('Fetched transaction status:', res);
                        if (res.status === 'valid') {
                            clearInterval(timer);
                            _this.getTransaction(tx_id).then(function (res) {
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
        }

        /**
         * @public
         *
         * @param transaction
         */

    }, {
        key: 'postTransaction',
        value: function postTransaction(transaction) {
            return this.req(this.getApiUrls('transactions'), {
                method: 'POST',
                jsonBody: transaction
            });
        }
    }]);

    return Connection;
}();

exports.default = Connection;
module.exports = exports['default'];