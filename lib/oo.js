// -------------------------------------------------------------------------79
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
