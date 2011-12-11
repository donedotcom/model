var DoneModel = (function () { var defined = {};defined.underscore = { _ : _ }; defined.backbone = Backbone;defined['./oo'] = (function () { var module = { exports : {} }; var exports = module.exports;// -------------------------------------------------------------------------79
// Done. OO utilities and class methods
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var _ = require('underscore')._;

// Shared empty constructor function to aid in prototype-chain creation.
var Ctor = function () {};

// ---------------------------------------------------------------------------
// Taken initially from Backbone.js (a) why not? and (b) it makes it easier
// to extend to Backbone models later as necessary.
//
// Original notes:
//  // Helper function to correctly set up the prototype chain, for subclasses.
//  // Similar to `goog.inherits`, but uses a hash of prototype properties and
//  // class properties to be extended.
// ---------------------------------------------------------------------------
var extend = exports.extend = function (objectProperties, classProperties) {
  var Parent = this,
      Child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call `super()`.
  if (objectProperties && objectProperties.hasOwnProperty('constructor')) {
    Child = objectProperties.constructor;
  } else {
    Child = function () {
      return Parent.apply(this, arguments);
    };
  }

  // Inherit class properties from Parent.
  _.extend(Child, Parent, classProperties || {});

  // Set the prototype chain to inherit from `Parent`, without calling
  // `Parent`'s constructor function.
  Ctor.prototype = Parent.prototype;
  Child.prototype = new Ctor();

  // Inherit object properties from the Parent
  _.extend(Child.prototype, Parent.prototype, objectProperties || {});

  // Correctly set Child's `prototype.constructor`.
  Child.prototype.constructor = Child;

  // Set a convenience property in case the Parent's prototype is needed later.
  Child.__super__ = Parent.prototype;

  Child.extend = extend;

  return Child;
};

// Add class and object properties to to this object from the mixinClass.
//
// **Mixins don't get a constructor, so they should set up any variables
// as needed in the method functions.
var mixin = exports.mixin = function (mixinClass) {
  var Klass = this,
      originalInitialize = Klass.prototype.initialize;

  // Will not override any existing functions
  _.defaults(Klass, mixinClass);
  _.defaults(Klass.prototype, mixinClass.prototype);

  return Klass;
};
return module.exports; }());defined['./path'] = (function () { var module = { exports : {} }; var exports = module.exports;// -------------------------------------------------------------------------79
// Done. Path resources for models
//
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------

var _ = require('underscore')._;

// Picks off the leaf (i.e., destination attribute name)
// of the path passed.
//
// @param path The full path to the attribute
// @returns {string} The destination attribute name
exports.leaf = function (path) {
  return path.split('.').pop();
};

// Finds the resource (i.e., destination model) of the path
//
// @param path A dot-separated identifier to an attribute w/ an
// arbitrary number of parent models; it is assumed to be
// relative to the top model
//
// @param context Either an instance of `DoneModel` or `ModelErrors`.
// If the former, we step through the submodels; if the latter,
// we step through the sub-error arrays.
//
// @param (optional) fillHoles A bool that determines whether or not any holes
// found in the path should be filled (with blank objects) created
// in their place. Used exclusively for setting paths with absent
// models right now.
//
// @returns The model found
exports.resource = function (path, context, fillHoles) {
  var isErrorModel = context.errors && _.isUndefined(context.attributes);

  var steps = path.split('.'),
      leaf = steps.pop(),
      resource = context;

  _.each(steps, function (step) {
    if (resource) {
      if (isErrorModel) {
        resource = resource.errors[step] === undefined ? undefined : resource.errors[step][0];
      } else {
        if (resource.get(step) === undefined && fillHoles) {
          resource.attributes[step] = {};
        }

        resource = resource.get(step);
      }
    }
  });

  return resource;
};return module.exports; }());defined['./model_errors'] = (function () { var module = { exports : {} }; var exports = module.exports;// -------------------------------------------------------------------------79
// Done. Database model error handling.  Modeled on the ActiveRecord errors
// class
// http://ar.rubyonrails.org/classes/ActiveRecord/Errors.html
//
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var _ = require('underscore')._,
    path = require('./path');

var Errors = module.exports = function (errors) {
  this.errors = errors || {};
};
var BaseField = ':base';

// Add a new error to field
//
// @param field The field to add the error to
// @param msg The error message to be recorded
Errors.prototype.add = function (field, msg) {
  this.errors[field] = this.errors[field] || [];
  this.errors[field].push(msg);
};

// Add an error to the base model; usually used in case an error does
// not apply to just one field
//
// @param msg The message to be added
Errors.prototype.add_to_base = function (msg) {
  this.add(BaseField, msg);
};

// Clear all errors
Errors.prototype.clear = function () {
  this.errors = {};
};

// Find the error message for a particular field
//
// @param fieldPath The path to the field requested
// @returns {undefined}, if there was a hole in the path.
//          {null}, if no errors are associated with the field
//          {string}, if one error is associated with the field
//          {Array}, if more than one error is associated with the field
Errors.prototype.on = function (fieldPath) {
  var leaf = path.leaf(fieldPath),
      resource = path.resource(fieldPath, this);

  if (!resource) {
    return undefined;
  }

  var errors = resource.errors[leaf] || null;

  if (errors && errors.length === 1) {
    return _.first(errors);
  } else {
    return errors;
  }
};

// Recurses into all submodels of the current path
// and reports the combined errors of all fields.
//
// @param prepend The model prepend to use for the prefix (e.g., a.b.c); built recursively
// @return {Object} The one-level JSON of the errors; note that all values are arrays
Errors.prototype.errorsToJSON = function (prepend) {
  var allErrors = {};
  var prefix = prepend ? prepend + '.' : '';

  _.each(this.errors, function (attrOrModel, name) {
    var tmpErrs = [], tmpObj = {};
    _.each(attrOrModel, function (error) {
      if (error instanceof Errors) {
        allErrors = _.extend(allErrors, error.errorsToJSON(prefix + name));
      } else {
        tmpErrs.push(error);
      }
    });

    if (tmpErrs.length > 0) {
      tmpObj[prefix + name] = tmpErrs;
      allErrors = _.extend(allErrors, tmpObj);
    }
  });
  return allErrors;
}

// Find errors assigned to the base object through add_to_base according
// to the normal rules of on(attribute).
//
// @returns {undefined|null|string|Array} The errors found (see `on`)
Errors.prototype.on_base = function () {
  return this.on(BaseField);
};

// Finds the number of total number of errors on this error object
// and all its sub-errors objects
//
// @returns {integer} the number of errors
Errors.prototype.count = Errors.prototype.length = Errors.prototype.size = function () {
  var count = 0;
  _.each(this.errorsToJSON(), function (error) {
    count += _.isArray(error) ? error.length : 1;
  });
  return count;
};

// Determines whether there are any errors
//
// @returns true if no errors, false if there are
Errors.prototype.isEmpty = function () {
  return _.isEmpty(this.errors);
};return module.exports; }());defined['./model'] = (function () { var module = { exports : {} }; var exports = module.exports;// -------------------------------------------------------------------------79
// Done. Database object abstraction
//
// This file and all its 'require's must not contain any database-specific
// actions.
// These need to be provided by the child class, which will implement them
// against a specific database.
//
// Terminology:
// - Model refers to the overall collection in the database; each Model is derive()d from DoneModel
// - Object refers to a specific document in the database; each Object is an instance of Model
//
// To create a Model, use the extend function:
// var Widget = DoneModel.extend();
//
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var _ = require('underscore')._,
        oo = require('./oo'),
        path = require('./path'),
        ModelErrors = require('./model_errors');

var DoneModel = module.exports = function (attrs) {
  return this.doneModelInitialize(attrs);
};

//
// Functions implemented directly in this class.
//
var modelFunctions = {

  // Adds a validation function to the Model
  //
  // @param field (optional) Which field this validation applies to
  // @param fn Returns if successful, throws an error with message if failure
  // @param message (optional) Custom message on error
  // @returns {undefined}
  validates : function (field, fn, message) {
    var validator;

    if (_.isFunction(field)) {
      message = fn;
      fn = field;
      field = null;
    }

    validator = { validate : fn, field : field, message : message };

    this.Validators = this.Validators || [];
    this.Validators.push(validator);
  },

  // Defines a hook to be executed
  //
  // @param hook The hook location; currently one of [beforeCreate, afterCreate, beforeSet, afterSet]
  // @action A function to be run
  // @returns {undefined}
  defineHook : function (hook, action) {
    this.hooks = this.hooks || {};
    this.hooks[hook] = action;
  },

  // Converts the attributes passed to JSON
  //
  // @param attrs The attributes to convert
  // @returns {Object} The clean object, if attrs is an object
  //          attrs, otherwise
  attributesToJSON : function (attrs) {
    if (!attrs) {
      return null;
    }
    if (typeof attrs !== 'object') {
      return attrs;
    }

    if (attrs.attributes) {
      attrs = attrs.attributes;
    }

    _.each(attrs, function (attr, key) {
      if (typeof attr === 'object') {
        attrs[key] = DoneModel.attributesToJSON(attr);
      } else {
        attrs[key] = attr;
      }
    });

    return attrs;
  },

  extend : oo.extend
};

var objectFunctions = {

  // Initializes a DoneModel with the contents of the other model or with the values in the object.
  // Should be called by the mixin base class.
  // Keeps a reference, not a copy, so make your own copy if this is a concern.
  //
  // @param {Object} another model or object with values (optional)
  // @returns {DoneModel} The new model
  doneModelInitialize : function (values) {
    this._processHook('beforeCreate');

    if (values && values.attributes) {
      this.attributes = values.attributes;
      this.errors = new ModelErrors(values.errors);
    } else {
      this.attributes = values || {};
      this.errors = new ModelErrors();
    }
    // Accessor for the id attribute -- pretend to be a MongoModel on the
    // server and a Backbone Model on the browser
    if (typeof process !== 'undefined' && process.title !== 'browser') {
      var self = this;
      this.__defineGetter__('id', function () {
        return self.get('_id');
      });
    } else {
      this.idElement = '_id';
      this.id = this.attributes[this.idElement];
    }

    this._processHook('afterCreate');

    return this;
  },

  // Retrieves an attribute from the model or its sub-models.
  //
  // @param fieldPath A path to the attribute requested
  // @returns {string|array|Object} The current value of the attribute
  get : function (fieldPath) {
    var leaf = path.leaf(fieldPath, this),
        resource = path.resource(fieldPath, this);

    if (!resource) {
      return null;
    }
    if (leaf === 'id') {
      return resource.id || resource.attributes.id;
    }
    if (resource._inSchema(leaf) && resource.attributes[leaf] === undefined) {
      return undefined;
    }
    return resource._wrapSchemaType(leaf, resource.attributes[leaf]);
  },

  // Sets a hash of one or more attributes in the model or its sub-models.
  //
  // @param pathHash A hash of one or more field:path mappings.
  // @returns {DoneModel} The updated model
  set : function (pathHash, options) {
    this._processHook('beforeSet');

    if (!pathHash) {
      return this;
    }
    var model = this;

    _.each(_.keys(pathHash), function (itemPath) {
      var leaf = path.leaf(itemPath, model),
          resource = path.resource(itemPath, model, true);

      if (resource) {
        resource.attributes[leaf] = DoneModel.attributesToJSON(pathHash[itemPath]);
      }
    });

    this._processHook('afterSet');

    return this;
  },

  // Unsets an attribute by making it undefined; silent if nonexistent.
  //
  // @param {string} fieldPath A path to the attribute to unset
  // @returns {DoneModel} The updated model
  unset : function (fieldPath) {
    var leaf = path.leaf(fieldPath, this),
        resource = path.resource(fieldPath, this);

    delete resource.attributes[leaf];

    return this;
  },

  // Returns true if this object passes validation, false if not.
  // object.errors will be updated.
  //
  // @returns {true|false}
  isValid : function () {
    // Use this.attributes if they are present (backbone)
    return this._performDoneValidation(this.attributes);
  },

  // Runs a hook
  //
  // @api private
  // @param hookName The name of the hook to be executed
  // @returns {undefined}
  _processHook : function (hookName) {
    if (this.hooks) {
      var hook = this.hooks[hookName],
          self = this;

      if (hook) {
        if (hook instanceof Array) {
          _.each(hook, function (hookItem) {
            hookItem(self);
          });
        } else {
          this.hooks[hookName](this);
        }
      }
    }
  },

  // Runs any validation rules for this model on the attributes provided in attrs
  // and checks against the schema.
  //
  // @api private
  // @param attrs The attributes to be validated against
  // @returns false if the object does not validate
  _performDoneValidation : function (attrs) {
    var self = this,
        Model = this.constructor;

    self.errors.clear();

    // Check against the Schema
    _.each(_.keys(attrs), function (field) {
      if (!self._inSchema(field)) {
        self.errors.add(field, 'Schema error');
        return;
      }

      var value = self._wrapSchemaType(field, attrs[field] || (attrs.attributes && attrs.attributes[field]));
      if (value instanceof DoneModel) {
        if (!value.isValid()) {
          self.errors.add(field, value.errors);
        }
      }

      if (value instanceof Array) {
        if (_.detect(value, function (elem) {
          if (elem instanceof DoneModel) {
            return !elem.isValid();
          } else {
            return false;
          }
        })) {
          self.errors.add(field, 'Embedded array validation errors');
        }
      }
    });

    // Validators created in the DoneModel.validates function
    if (Model.Validators) {
      _.each(Model.Validators, function (validator) {
        var message = validator.message,
            value;

        if (validator.field) {
          value = attrs[validator.field];
          try {
            validator.validate.call(self, value, message);
          } catch (error) {
            self.errors.add(validator.field, error.message);
          }
        } else {
          try {
            validator.validate.call(self, message);
          } catch (error2) {
            self.errors.add_to_base(error2.message);
          }
        }
      });
    }
    return self.errors.isEmpty();
  },

  // Looks for the field in the schema.
  //
  // @api private
  // @param field The field to check
  // @returns true if this field is defined in the schema, false if not
  _inSchema : function (field) {
    var Model = this.constructor;
    return field === '_id' || !!Model.Schema[field];
  },

  // Throws error if field is not in the schema
  //
  // @api private
  // @param field The field to enforce against
  _enforceSchema : function (field) {
    if (!this._inSchema(field)) {
      throw new Error('Schema error: ' + field);
    }
  },

  // Wrap in correct type
  //
  // @api private
  // @param field The field to wrap
  // @param value The value of the field
  // @returns {string|Object} The wrapped field/value
  _wrapSchemaType : function (field, value) {
    var Model = this.constructor,
        Klass;

    this._enforceSchema(field);

    if (!_.isObject(Model.Schema[field])) {
      return value;
    }

    Klass = Model.Schema[field];
    if (Klass instanceof Array) {
      Klass = Klass[0];
      // Enforce reasonable alternatives if the value is not an array itself
      if (!value) {
        return [];
      }
      if (!value instanceof Array) {
        return [new Klass(value)];
      }
      return _.map(value, function (elem) {
        return new Klass(elem);
      });
    } else {
      return new Klass(value);
    }
  }
};

_.extend(DoneModel, modelFunctions);
_.extend(DoneModel.prototype, objectFunctions);
return module.exports; }());defined['./backbone_model'] = (function () { var module = { exports : {} }; var exports = module.exports;// -------------------------------------------------------------------------79
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
    DoneModel = require('./model'),
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

  set : function () {
    var result = DoneModel.prototype.set.apply(this, arguments);
    return result.errors.isEmpty();
  }
};

var BackboneModel = module.exports = Backbone.Model.extend(objectFunctions, modelFunctions);

BackboneModel.mixin = oo.mixin;

// Mix in base DoneModel functionality in any case
BackboneModel.mixin(DoneModel);return module.exports; }());function require(name) { return defined[name]; } return { Model : defined["./model"], BackboneModel : defined["./backbone_model"] }; }());