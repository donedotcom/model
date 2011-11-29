// -------------------------------------------------------------------------79
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

  extend : oo.extend
};

var objectFunctions = {

  // Initializes a DoneModel.  Should be called by the mixin base class.
  // @param {Object} another model or object with values (optional)
  //  Initialize with the contents of the other model or with the values in the object.
  //  Keeps a reference, not a copy, so make your own copy if this is a concern.
  doneModelInitialize : function (values) {
    if (values && values.attributes) {
      this.attributes = values.attributes;
      this.errors = new ModelErrors(values.errors);
    } else {
      this.attributes = values || {};
      this.errors = new ModelErrors();
    }
    // Accessor for the id attribute -- pretend to be a MongoModel on the
    // server and a Backbone Model on the browser
    if (process && process.title !== 'browser') {
      var self = this;
      this.__defineGetter__('id', function () {
        return self.get('_id');
      });
    } else {
      this.idElement = '_id';
      this.id = this.attributes[this.idElement];
    }
    return this;
  },

  // Get attribute value
  get : function (fieldPath) {
    var leaf = path.leaf(fieldPath, this),
        resource = path.resource(fieldPath, this);

    if (!resource) {
      return null;
    }

    return resource._wrapSchemaType(leaf, resource.attributes[leaf]);
  },

  set : function (pathHash) {
    var model = this;

    _.each(_.keys(pathHash), function (itemPath) {
      var leaf = path.leaf(itemPath, model),
          resource = path.resource(itemPath, model);
      
      if (resource) {
        resource.attributes[leaf] = pathHash[itemPath];
      }
    });

    return this;
  },

  // Unsets an attribute (via its path) by making it undefined;
  // is silent if the attribute doesn't exist
  unset : function (fieldPath) {
    var leaf = path.leaf(fieldPath, this),
        resource = path.resource(fieldPath, this);
    
    delete resource.attributes[leaf];

    return this;
  },

  // Returns true if this object passes validation, false if not.
  // object.errors will be updated.
  isValid : function () {
    // Use this.attributes if they are present (backbone)
    return this._performDoneValidation(this.attributes);
  },

  // Runs any validation rules for this model on the attributes provided in attrs
  // and checks against the Schema.
  //
  // @returns False if the Object does not validate
  // @api private
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
          } catch (error) {
            self.errors.add_to_base(error.message);
          }
        }
      });
    }
    return self.errors.isEmpty();
  },
  
  // Returns true if this field is defined in the schema, false if not
  _inSchema : function (field) {
    var Model = this.constructor;
    return field === '_id' || !!Model.Schema[field];
  },
  
  // Throws error if field is not in Schema
  _enforceSchema : function (field) {
    if (!this._inSchema(field)) {
      throw new Error('Schema error: ' + field);
    }
  },
  
  // Wrap in correct type
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
