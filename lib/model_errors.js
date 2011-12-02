// -------------------------------------------------------------------------79
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
// @param prepend
// @param fieldPath The path to the field/model requested
Errors.prototype.errorsToJSON = function (field) {
  var allErrors = {};
  var prefix = field ? field + '.' : '';

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

// Finds the number of errors
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
};