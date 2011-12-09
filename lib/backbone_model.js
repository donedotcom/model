// -------------------------------------------------------------------------79
//  Done. custom Backbone base model class.  Provides a mixin function so
//  you can add DoneModel functionality.
//
//  // Create a Backbone model as normal
//  var Widget = BackboneModel.extend({});
//
//  Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var _ = require('underscore')._,
    Backbone = require('backbone'),
    DoneModel = require('model').Model,
    oo = require('./oo');

//
// Model functions (class functions) to be added to all BackboneModel objects
//
var modelFunctions = {
};

//
// Object functions (prototype functions) to be added to all BackboneModel
// instances
//
var objectFunctions = {
  idAttribute : '_id',

  hooks : {
    afterSet : function (model) {
      if (model.isValid()) {
        model.trigger('change', model, model.errors, {});
      } else {
        model.trigger('error', model, model.errors, {});
      }
    }
  },

  constructor : function (attrs, options) {
    this.doneModelInitialize.apply(this, arguments);
    Backbone.Model.call(this, this.attributes, options);
  },

  validate : function (attrs) {
    this._performDoneValidation(attrs);
    this.trigger('change:errors');
    return this.errors.count() !== 0 ? this.errors : null;
  },

  get : DoneModel.prototype.get,

  set : DoneModel.prototype.set
};

var BackboneModel = module.exports = Backbone.Model.extend(objectFunctions, modelFunctions);

BackboneModel.mixin = oo.mixin;

// Mix in base DoneModel functionality in any case
BackboneModel.mixin(DoneModel);