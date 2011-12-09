// -------------------------------------------------------------------------79
// Done. Backbone-backed Model Spec
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var assert = require('assert'),
    vows = require('vows'),
    check = require('validator').check,
    DoneModel = require('../lib/model'),
    BackboneModel = require('../lib/backbone_model');

var Widget = BackboneModel.extend({}, {
  Schema: {
    name: true
  }
});

var validationText = 'must not be null and should be at least 3 characters';
Widget.validates('name', function (value, message) {
    return check(value, message).notNull().len(3, 20);
  }, validationText);

Widget.validates(function (message) {
    return check(this.setForError, message).isNull();
  }, 'base error');

vows.describe('BackboneModel').addBatch({
  'create with invalid field': {
    topic: function () {
      var widget = new Widget({ });
      widget.bind('error', function (model, error, options) {
        this.callback(error, model);
      }, this);
      widget.set({ });
    },
    'should have an error on name field': function (err, widget) {
      assert.equal(err.on('name'), validationText);
    }
  },
  'create with valid field' : {
    topic: new Widget({ name: 'josh' }),
    'should have the field': function (widget) {
      assert.equal(widget.get('name'), 'josh');
    }
  }
}).export(module);