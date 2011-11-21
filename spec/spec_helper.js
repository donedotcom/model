// -------------------------------------------------------------------------79
// Done. Spec Helper
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------

// Load expected global variables
ENV = 'test';
var done = require('done');

var db = exports.db = done.mongo;
var clearDatabase = exports.clearDatabase = function (callback) {
  db.connect(function (err) {
    db.mongo.collections(function (err, collections) {
      collections = _.filter(collections, function (collection) {
        return !collection.collectionName.match(/^system\./);
      });
      var removals = collections.length;

      _.each(collections, function (collection) {
        collection.remove(function () {
          removals -= 1;
          if (removals === 0) {
            callback();
          }
        });
      });
    });
  });
};

exports.factory = require('./factory');
