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
                    const compiledAsset = new ConcatSource(main.children[0])
                    compiledAsset.add(vendor)
                    compiledAsset.add(main.children[1])
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
