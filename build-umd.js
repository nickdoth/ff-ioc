const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

writeFileSync(join(__dirname, 'dist/umd.js'), 
`(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
        var _global = typeof window !== 'undefined' ? window : global;
        var exports = _global.FFIOC = {};
        var require = function() { throw 'Not Implemented'; };
        var v = factory(require, exports);
        if (v !== undefined) _global.FFIOC = v;
    }
})(function (require, exports) {
${readFileSync(join(__dirname, 'lib/index.js'))}
});
//# sourceMappingURL=index.js.map
`);