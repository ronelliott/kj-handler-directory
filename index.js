'use strict';

module.exports = function(resolver) {
    resolver.add('directory', require('./view'));
};
