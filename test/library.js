/* global describe, it */

var assert = require('assert');
var util = require('../lib/util');

describe('Utility Functions', function() {
  describe('provides a capability to determine effective concurrency', function() {
    it('should have "concurrency" to recommend a safe limit greater than 2', function() {
      var limit = util.concurrency;
      assert(limit >= 2, 'concurrency limit not >= 2');
    });
  });
  describe('provides a capability to construct absolute URLs', function() {
    it('allows expansion of a root path', function() {
      var items = util.expandUrls('http://example.com', ['/']);
      assert.equal('http://example.com/', items[0]);
    });
    it('allows expansion of multiple paths', function() {
      var items = util.expandUrls('http://example.com', ['/a', '/b']);
      assert.equal('http://example.com/a', items[0]);
      assert.equal('http://example.com/b', items[1]);
    });
    it('allows expansion of a base URL with a base path', function() {
      var items = util.expandUrls('http://example.com/subsite', ['/a', '/b']);
      assert.equal('http://example.com/subsite/a', items[0]);
      assert.equal('http://example.com/subsite/b', items[1]);
    });
  });
});

describe('Initialization', function() {
  var grunt = require('grunt');

  describe('of magic configuration', function() {
    it('should defer to the "GDT" namespace', function(done) {
      grunt.config.init({
        config: {testA: 'Enterprise'},
        gdt: {testA: 'Victory'}
      });
      process.env.GDT_TEST_A = 'Yamaguchi';

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic('testA'), 'Victory');
      done();
    });
    it('should defer to environment over normal project configuration', function(done) {
      grunt.config.init({
        config: {testB: 'Enterprise'}
      });
      process.env.GDT_TEST_B = 'Yamaguchi';

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic('test_b'), 'Yamaguchi');
      done();
    });
    it('should fall back to the project configuration', function(done) {
      grunt.config.init({
        config: {testC: 'Enterprise'}
      });

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic('testC'), 'Enterprise');
      done();
    });
    it('should allow override of the environment variable name', function(done) {
      grunt.config.init({
        config: {testD: 'Enterprise'}
      });
      process.env.GDT_TEST_DELTA = 'Yamaguchi';

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic('testD', 'test_delta'), 'Yamaguchi');
      done();
    });
    it('should allow override of the environment variable name without affecting priority', function(done) {
      grunt.config.init({
        config: {testE: 'Enterprise'}
      });

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic('testE', 'test_epsilon'), 'Enterprise');
      done();
    });
    it('should allow a nested value to be overridden', function(done) {
      grunt.config.init({
        config: {nested: {item: 'a'}}
      });

      var init = require('../lib/init')(grunt);
      assert.equal(init.magic(['nested', 'item'], 'nested_item'), 'a');
      done();
    });
  });
});
