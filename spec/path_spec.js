// -------------------------------------------------------------------------79
// Done. Model path spec
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var helper = require('./spec_helper'),
    assert = require('assert'),
    vows = require('vows'),
    check = require('validator').check,
    oo = require('../lib/oo'),
    DoneModel = require('../lib/model');

// Example model schema with three levels
var LookingGlassBase = DoneModel.extend({}, {
  Schema : {
    author : true,
    wonderland : DoneModel.extend({}, {
      Schema : {
        girl : true
      }
    }),
    matrix : DoneModel.extend({}, {
      Schema : {
        name : true,
        pillColor : true,
        meta : DoneModel.extend({}, {
          Schema : {
            releaseYear : true
          }
        })
      }
    })
  }
});

var LookingGlass = function () {
  this.doneModelInitialize.apply(this, arguments);
};
LookingGlass.mixin = oo.mixin;
LookingGlass.mixin(LookingGlassBase);

function create(obj) {
  return function () {
    var lg = new LookingGlass(obj);
    lg.isValid();
    this.callback(null, lg);
  };
}

vows.describe('Path').addBatch({
  'simple path cases' : {
    topic : create({
      _id : '1234',
      author : 'Carroll',
      wonderland : { _id : '9832', girl : 'Alice' },
      matrix : {
        _id : '5678',
        name : 'Neo',
        pillColor : 'blue',
        meta : { _id : '4329', releaseYear: '1999' }
      }
    }),
    'can retrieve top-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('author'), 'Carroll');
      assert.equal(lookingGlass.get('id'), '1234');
    },
    'can retrieve second-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('wonderland.girl'), 'Alice');
      assert.equal(lookingGlass.get('wonderland.id'), '9832');
    },
    'can retrieve third-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('matrix.meta.releaseYear'), '1999');
      assert.equal(lookingGlass.get('matrix.meta.id'), '4329');
    }
  },
  'path cases with absent nodes' : {
    topic : create({
      author : 'Carroll',
      matrix : {
        name : 'Neo',
        pillColor : 'blue'
      }
    }),
    'retrieve second-level element when parent is not present' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('wonderland.girl'), undefined);
    },
    'retrieve third-level element when parent is not present' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('matrix.meta'), undefined);
      assert.equal(lookingGlass.get('matrix.meta.releaseYear'), undefined);
      assert.equal(lookingGlass.get('matrix.meta.id'), undefined);
    }
  }
}).export(module);