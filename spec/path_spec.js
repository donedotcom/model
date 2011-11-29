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
      author : 'Carroll',
      wonderland : { girl : 'Alice' },
      matrix : {
        name : 'Neo',
        pillColor : 'blue',
        meta : { releaseYear: '1999' }
      }
    }),
    'can retrieve top-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('author'), 'Carroll');
    },
    'can retrieve second-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('wonderland.girl'), 'Alice');
    },
    'can retrieve third-level element' : function (err, lookingGlass) {
      assert.equal(lookingGlass.get('matrix.meta.releaseYear'), '1999');
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
      assert.equal(lookingGlass.get('matrix.meta.releaseYear'), undefined);
    }
  }
}).export(module);