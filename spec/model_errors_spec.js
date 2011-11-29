var _ = require('underscore')._,
    assert = require('assert'),
    vows = require('vows'),
    ModelErrors = require('../lib/model_errors');

var errorText1 = 'You never call me anymore';
var errorText2 = 'Jellybeans are not an apology';

vows.describe('ModelErrors').addBatch({
  'new errors object': {
    topic : new ModelErrors(),
    'should have no errors' : function (errors) {
      assert.isTrue(errors.isEmpty());
    },
    'should have no error on base' : function (errors) {
      assert.isNull(errors.on_base());
    },
    'should have no error on a field' : function (errors) {
      assert.isNull(errors.on('field'));
    }
  }
}).addBatch({
  'with a field error': {
    topic: function () {
      var errors = new ModelErrors();
      errors.add('field', errorText1);
      this.callback(null, errors);
    },
    'should have errors' : function (errors) {
      assert.isFalse(errors.isEmpty());
    },
    'should have exactly one error' : function (errors) {
      assert.equal(errors.count(), 1);
    },
    'should have an error on field' : function (errors) {
      assert.equal(errors.on('field'), errorText1);
    },
    'should have no error on base' : function (errors) {
      assert.isNull(errors.on_base());
    },
    'should have no error on other field' : function (errors) {
      assert.isNull(errors.on('field2'));
    },
    'when cleared' : {
      topic : function (errors) {
        errors.clear();
        this.callback(null, errors);
      },
      'should have no errors' : function (errors) {
        assert.isTrue(errors.isEmpty());
      }
    }
  }
}).addBatch({
  'with two field errors': {
    topic: function () {
      var errors = new ModelErrors();
      errors.add('field', errorText1);
      errors.add('field', errorText2);
      this.callback(null, errors);
    },
    'should have errors' : function (errors) {
      assert.isFalse(errors.isEmpty());
    },
    'should have exactly two errors' : function (errors) {
      assert.equal(errors.count(), 2);
    },
    'should have two errors on field' : function (errors) {
      assert.equal(errors.on('field').length, 2);
    },
    'should have the correct errors on field' : function (errors) {
      assert.isTrue(_.isEqual(errors.on('field'), [errorText1, errorText2]));
    },
    'should have no error on base' : function (errors) {
      assert.isNull(errors.on_base());
    },
    'should have no error on other field' : function (errors) {
      assert.isNull(errors.on('field2'));
    },
    'when cleared' : {
      topic : function (errors) {
        errors.clear();
        this.callback(null, errors);
      },
      'should have no errors' : function (errors) {
        assert.isTrue(errors.isEmpty());
      }
    }
  }
}).addBatch({
  'with a base error': {
    topic: function () {
      var errors = new ModelErrors();
      errors.add_to_base(errorText1);
      this.callback(null, errors);
    },
    'should have errors' : function (errors) {
      assert.isFalse(errors.isEmpty());
    },
    'should have exactly one error' : function (errors) {
      assert.equal(errors.count(), 1);
    },
    'should have an error on base' : function (errors) {
      assert.equal(errors.on_base(), errorText1);
    },
    'should have no error on field' : function (errors) {
      assert.isNull(errors.on('field'));
    },
    'when cleared' : {
      topic : function (errors) {
        errors.clear();
        this.callback(null, errors);
      },
      'should have no errors' : function (errors) {
        assert.isTrue(errors.isEmpty());
      }
    }
  }
}).export(module);