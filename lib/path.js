// -------------------------------------------------------------------------79
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
};