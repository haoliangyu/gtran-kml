'use strict';

var promiseLib;

exports.set = function(promiseLib) {

    if (promiseLib) {
        promiseLib = parsePromiseLib(promiseLib);
    } else {
        // if not ES6, native Promise is not support
        if (typeof(Promise) === 'undefined') {
            throw new TypeError('Promise library must be specified.');
        }
        promiseLib = parsePromiseLib(Promise);
    }

    return promiseLib;
};

exports.promisify = function(func) {
    if (!promiseLib) { promiseLib = parsePromiseLib(Promise); }

    return function () {
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
            args.push(function (err, res) {
                if (err) { reject(err); }
                else { resolve(res); }
            });
            func.apply(null, args);
        });
    };
};

function parsePromiseLib(promiseLib) {

    var libType = typeof promiseLib;

    if (libType === 'function' || libType === 'object') {
        var root = promiseLib.Promise instanceof Function ? promiseLib.Promise : promiseLib,
            methods = ['resolve', 'reject', 'all'],
            success = true;

        var promise = function(func) {
            return new root(func);
        };

        methods.forEach(function(method) {
            promise[method] = root[method];
            success = success && root[method] instanceof Function;
        });

        if (success) {
            return promise;
        }
    } else {
        throw new TypeError('Invalid promise library specified.')
    }
}
