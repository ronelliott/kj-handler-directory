'use strict';

const Cache = require('./cache'),
      fs = require('fs'),
      is = require('is'),
      mime = require('mime'),
      path = require('path');

module.exports = function($opts) {
    if (!$opts.base) {
        throw new Error('No base path defined!');
    }

    var base = path.resolve($opts.base),
        cache,
        shouldSetContentType = is.defined($opts.contentType) ? !!$opts.contentType : true;

    if ($opts.cache) {
        cache = $opts.cache;

        if (is.boolean(cache)) {
            cache = new Cache();
        }
    }

    return function($params, $res, $next, $finish) {
        var assetPath = path.join(base, $params.asset),
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
                data = data.toString();
                cache.set(assetPath, data);
            }

            send(err, data);
        });

        function send(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    $finish({ notFound: true });
                    return;
                }

                $next(err);
                return;
            }

            if (shouldSetContentType) {
                var contentType = is.string($opts.contentType) ? $opts.contentType : mime.lookup(assetPath);
                $res.header('Content-Type', contentType);
            }

            $res.write(data);
            $finish();
        }
    };
};
