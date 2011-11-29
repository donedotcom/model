// -------------------------------------------------------------------------79
// Done. Path resources for models
//
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------

var _ = require('underscore')._;

// Returns the leaf (i.e., destination attribute name) of the path
exports.leaf = function (path) {
  return path.split('.').pop();
};

// Returns the resource (i.e., destination model) of the path
//
// `path` is a dot-separated identifier to a model with an
// arbitrary number of parent models; it is assumed to be
// relative to the top model
// 
// `context` is either an instance of `DoneModel` or `ModelErrors`.
// If the former, we step through the submodels; if the latter,
// we step through the sub-error arrays.
//
exports.resource = function (path, context) {
  var isErrorModel = context.errors && _.isUndefined(context.attributes);

  var steps = path.split('.'),
      leaf = steps.pop(),
      resource = context;

  _.each(steps, function (step) {
    if (resource) {
      resource = isErrorModel ? resource.errors[step][0] : resource.get(step);
    }
  });

  return resource;
};