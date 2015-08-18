'use strict';

var Cache = require('../cache'),
    should = require('should');

describe('cache', function() {
    describe('get', function() {
        beforeEach(function() {
            this.cache = new Cache();
        });

        it('should return the value if the item was stored', function() {
            this.cache.set('foo', 'bar');
            this.cache.get('foo').should.equal('bar');
        });
    });

    describe('has', function() {
        beforeEach(function() {
            this.cache = new Cache();
        });

        it('should return false if the value was not set', function() {
            this.cache.has('foo').should.equal(false);
        });

        it('should return true if the value was set', function() {
            this.cache.set('foo', 'bar');
            this.cache.has('foo').should.equal(true);
        });

        it('should return true if the value was set to null', function() {
            this.cache.set('foo', null);
            this.cache.has('foo').should.equal(true);
        });

        it('should return true if the value was set to undefined', function() {
            this.cache.set('foo', undefined);
            this.cache.has('foo').should.equal(true);
        });
    });

    describe('set', function() {
        beforeEach(function() {
            this.cache = new Cache();
        });

        it('should set the value given', function() {
            this.cache.set('foo', 'bar');
            this.cache.values.should.eql({ foo: 'bar' });
        });
    });
});
