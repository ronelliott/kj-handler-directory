'use strict';

function Cache(values) {
    this.values = values || {};
}

Cache.prototype = {
    get: function(name) {
        return this.values[name];
    },

    has: function(name) {
        return Object.keys(this.values).indexOf(name) !== -1;
    },

    set: function(name, value) {
        this.values[name] = value;
    }
};

module.exports = Cache;
