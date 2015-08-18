'use strict';

var Cache = require('./cache'),
    fs = require('fs'),
    is = require('is'),
    mime = require('mime'),
    objectPath = require('object-path'),
    path = require('path');

module.exports = function(params) {
    if (!params.base) {
        throw new Error('No base path defined!');
    }

    var base = path.resolve(params.base),
        cache,
        input = params.input || 'params.asset',
        shouldSetContentType = is.defined(params.contentType) ? !!params.contentType : true;

    if (params.cache) {
        cache = params.cache;

        if (is.boolean(cache)) {
            cache = new Cache();
        }
    }

    return function(resolver, res, finish) {
        var inputObjName = input.split('.')[0],
            inputObj = {};

        inputObj[inputObjName] = resolver(inputObjName);

        var asset = objectPath.get(inputObj, input),
            assetPath = path.join(base, asset),
            data;

        if (cache) {
            data = cache.get(assetPath);
        }

        if (data) {
            send(null, data);
            return;
        }

        fs.readFile(assetPath, function(err, data) {
            if (cache && data) {
                cache.set(assetPath, data);
            }

            send(err, data);
        });

        function send(err, data) {
            if (data) {
                if (shouldSetContentType) {
                    var contentType = is.string(params.contentType) ? params.contentType : mime.lookup(assetPath);
                    res.headers('Content-Type', contentType);
                }

                res.write(data);
                res.end();
            }

            finish(err);
        }
    };
};
