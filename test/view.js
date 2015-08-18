'use strict';

var path = require('path'),
    basePath = path.resolve(__dirname),
    proxyquire = require('proxyquire'),
    reflekt = require('reflekt'),
    should = require('should'),
    sinon = require('sinon'),
    Cache = require('../cache'),
    factory = require('../view');

function MockCache() {}
MockCache.prototype = { get: sinon.spy(), has: sinon.spy(), set: sinon.spy() };

describe('directory', function() {
    it('should write the file data to the response', function(done) {
        var resolver = new reflekt.ObjectResolver({ params: { asset: 'static/main.css' } }),
            written = '',
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            params = { base: basePath };
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            written.should.equal('.foo { background-color: #f00; }\n');
            done();
        });
    });

    it('should set the Content-Type if the options dictate so', function(done) {
        var resolver = new reflekt.ObjectResolver({ params: { asset: 'static/main.css' } }),
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy() },
            params = { base: basePath, contentType: true };
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            res.headers.calledWith('Content-Type', 'text/css').should.equal(true);
            done();
        });
    });

    it('should throw an error if no base path is defined', function() {
        (function() {
            factory({});
        }).should.throw('No base path defined!');
    });

    it('should use the defined input path', function(done) {
        var resolver = new reflekt.ObjectResolver({ duck: { sauce: 'static/main.css' } }),
            written = '',
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            params = { base: basePath, input: 'duck.sauce' };
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            written.should.equal('.foo { background-color: #f00; }\n');
            done();
        });
    });

    it('should use the cache if it is enabled', function(done) {
        var resolver = new reflekt.ObjectResolver({ params: { asset: 'static/main.css' } }),
            written = '',
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            cache = new Cache(),
            params = { base: basePath, cache: cache };
        cache.set(path.resolve(__dirname, 'static/main.css'), 'foo');
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            written.should.equal('foo');
            done();
        });
    });

    it('should set the data in the cache if it is enabled', function(done) {
        var resolver = new reflekt.ObjectResolver({ params: { asset: 'static/main.css' } }),
            written = '',
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy(function(data) {
                written = data.toString();
            }) },
            cache = new Cache(),
            params = { base: basePath, cache: cache };
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            var value = '.foo { background-color: #f00; }\n';
            cache.get(path.resolve(__dirname, 'static/main.css')).should.equal(value);
            written.should.equal(value);
            done();
        });
    });

    it('should create a cache if a boolean is passed instead of a cache object', function(done) {
        var resolver = new reflekt.ObjectResolver({ params: { asset: 'static/main.css' } }),
            res = { end: sinon.spy(), headers: sinon.spy(), write: sinon.spy() },
            params = { base: basePath, cache: true };

        MockCache.prototype = { get: sinon.spy(), has: sinon.spy(), set: sinon.spy() };
        var factory = proxyquire('../view', { './cache': MockCache });
        factory(params)(resolver, res, function(err) {
            should(err).equal(null);
            MockCache.prototype.get.called.should.equal(true);
            done();
        });
    });
});
