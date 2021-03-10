// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable strict, no-console, object-shorthand, import/no-extraneous-dependencies */

const { ConcatSource } = require('webpack-sources')

module.exports = class AddVendorsPlugin {
    constructor(base) {
        this.base = base
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            `AddVendorsPlugin ${this.base}`,
            (compilation, callback) => {
                const main = compilation.assets[`main.${this.base}`]
                const mainMap = compilation.assets[`main.${this.base}.map`]
                const vendor = compilation.assets[`vendors.${this.base}`]

                if (main && vendor) {
                    const compiledAsset = new ConcatSource(main._value[0])
                    compiledAsset.add(vendor)
                    compiledAsset.add(main._value[1])
                    compilation.assets = {}
                    compilation.assets[this.base] = compiledAsset
                } else if (main && mainMap) {
                    compilation.assets = {}
                    compilation.assets[this.base] = main
                    compilation.assets[`${this.base}.map`] = mainMap
                }

                callback()
            }
        )
    }
}
