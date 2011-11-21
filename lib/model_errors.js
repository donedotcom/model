// -------------------------------------------------------------------------79
// Done. Database model error handling.  Modeled on the ActiveRecord errors
// class
// http://ar.rubyonrails.org/classes/ActiveRecord/Errors.html
//
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var _ = require('underscore')._;

var Errors = module.exports = function (errors) {
  this.errors = errors || {};
};
var BaseField = ':base';

/**
  Add a new error to field
*/
Errors.prototype.add = function (field, msg) {
  this.errors[field] = this.errors[field] || [];
  this.errors[field].push(msg);
};

// Add an error to the base model; usually used in case an error does
// not apply to just one field
Errors.prototype.add_to_base = function (msg) {
  this.add(BaseField, msg);
};

// Clear all errors
Errors.prototype.clear = function () {
  this.errors = {};
};

// Returns null, if no errors are associated with the specified attribute.
// Returns the error message, if one error is associated with the specified
// attribute.
// Returns an array of error messages, if more than one error is associated
// with the specified attribute.
Errors.prototype.on = function (field) {
  var errors = this.errors[field] || null;

  if (errors && errors.length === 1) {
    return _.first(errors);
  } else {
    return errors;
  }
};

// Returns errors assigned to the base object through add_to_base according
// to the normal rules of on(attribute).
Errors.prototype.on_base = function () {
  return this.on(BaseField);
};

// Returns the number of errors
Errors.prototype.count = Errors.prototype.length = Errors.prototype.size = function () {
  return _.reduce(this.errors, function (count, field) {
      return count + field.length;
    }, 0);
};

// Returns true if no errors
Errors.prototype.isEmpty = function () {
  return _.isEmpty(this.errors);
};