// This may be referenced by the other files, so it should be first.
// You can configure the options externally
exports.config = {
  templateCache : true,
  logger : {
    console: {
      level: 'warning'
    }
  }
};

exports.Model = require('./lib/model');
exports.ModelErrors = require('./lib/model_errors');
