'use strict';

var path = require('path'),
    basePath = path.resolve(__dirname),
    proxyquire = require('proxyquire'),
    reflekt = require('reflekt'),
    should = require('should'),
    sinon = require('sinon'),
    Cache = require('../cache'),
    handler = require('../handler');

function MockCache() {}
MockCache.prototype = { get: sinon.spy(), has: sinon.spy(), set: sinon.spy() };

describe('directory', function() {
    it('should write the file data to the response', function(done) {
        var written = '',
            res = { end: sinon.spy(), header: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            params = { base: basePath},
            next = sinon.spy();
        handler(params)({ asset: 'static/main.css' }, res, next, function(err) {
            should(err).not.be.ok();
            written.should.equal('.foo { background-color: #f00; }\n');
            done();
        });
    });

    it('should set the Content-Type if the options dictate so', function(done) {
        var res = { end: sinon.spy(), header: sinon.spy(), write: sinon.spy() },
            params = { base: basePath, contentType: true },
            next = sinon.spy();
        handler(params)({ asset: 'static/main.css' }, res, next, function(err) {
            should(err).not.be.ok();
            res.header.calledWith('Content-Type', 'text/css').should.equal(true);
            done();
        });
    });

    it('should throw an error if no base path is defined', function() {
        (function() {
            handler({});
        }).should.throw('No base path defined!');
    });

    it('should use the cache if it is enabled', function(done) {
        var written = '',
            res = { end: sinon.spy(), header: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            cache = new Cache(),
            params = { base: basePath, cache: cache },
            next = sinon.spy();
        cache.set(path.resolve(__dirname, 'static/main.css'), 'foo');
        handler(params)({ asset: 'static/main.css' }, res, next, function(err) {
            should(err).not.be.ok();
            written.should.equal('foo');
            done();
        });
    });

    it('should set the data in the cache if it is enabled', function(done) {
        var written = '',
            res = { end: sinon.spy(), header: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            cache = new Cache(),
            params = { base: basePath, cache: cache },
            next = sinon.spy();
        handler(params)({ asset: 'static/main.css' }, res, next, function(err) {
            should(err).not.be.ok();
            var value = '.foo { background-color: #f00; }\n';
            cache.get(path.resolve(__dirname, 'static/main.css')).should.equal(value);
            written.should.equal(value);
            done();
        });
    });

    it('should create a cache if a boolean is passed instead of a cache object', function(done) {
        var res = { end: sinon.spy(), header: sinon.spy(), write: sinon.spy() },
            params = { base: basePath, cache: true },
            next = sinon.spy();

        MockCache.prototype = { get: sinon.spy(), has: sinon.spy(), set: sinon.spy() };
        var handler = proxyquire('../handler', { './cache': MockCache });
        handler(params)({ asset: 'static/main.css' }, res, next, function(err) {
            should(err).not.be.ok();
            MockCache.prototype.get.called.should.equal(true);
            done();
        });
    });
});
