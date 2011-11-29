// -------------------------------------------------------------------------79
// Done. Model abstraction spec
// Copyright (c) 2011 Done. Corporation
// ---------------------------------------------------------------------------
var helper = require('./spec_helper'),
    assert = require('assert'),
    vows = require('vows'),
    check = require('validator').check,
    oo = require('../lib/oo'),
    DoneModel = require('../lib/model');

var validationText = 'must not be null and should be at least 3 characters';

var SubWidget = DoneModel.extend({}, {
  Schema : {
    name : true
  }
});

SubWidget.validates('name', function (value, message) {
    return check(value, message).notNull().len(3, 20);
  }, validationText);

// DoneModel is designed to be mixed in
var WidgetBase = DoneModel.extend({}, {
  Schema : {
    name : true,
    additionalField : true,
    setForError : true,
    exampleWidget : SubWidget, // single embedded widget
    examples : [SubWidget],    // array of embedded widgets,
    dataArray : true
  }
});

var Widget = function () {
  this.doneModelInitialize.apply(this, arguments);
};
Widget.mixin = oo.mixin;
Widget.mixin(WidgetBase);

Widget.validates('name', function (value, message) {
    return check(value, message).notNull().len(3, 20);
  }, validationText);

Widget.validates(function (message) {
    return check(this.get('setForError'), message).isNull();
  }, 'base error');


function create(obj) {
  return function () {
    var widget = new Widget(obj);
    widget.isValid();
    this.callback(null, widget);
  };
}

vows.describe('DoneModel').addBatch({
// ---------------------------------------------------------------------------
// Schema behavior
// ---------------------------------------------------------------------------
  'widget' : {
    topic : create({ name : 'myName' }),
    'can get schema field [name]' : function (err, widget) {
      assert.equal(widget.get('name'), 'myName');
    },
    'exception to get non-schema field [birthdate]' : function (err, widget) {
      try {
        widget.get('birthdate');
      } catch (err) {
        assert.equal(err.message, 'Schema error: birthdate');
        return;
      }
      assert.ok(false); // Should not get here
    }
  },
  'valid widget with non-schema field' : {
    topic : create({ name : 'paul', birthdate : 'june' }),
    'widget should not be valid' : function (err, widget) {
      assert.isFalse(widget.isValid());
    },
    'should have error on birthdate': function (err, widget) {
      assert.equal(widget.errors.on('birthdate'), 'Schema error');
    }
  },

  //
  // Embedded widget
  //

  'widget with single embedded widget' : {
    topic : create({ exampleWidget : { name : 'example' } }),
    'can get embedded widget' : function (err, widget) {
      assert.ok(widget.get('exampleWidget'));
    },
    'embedded widget has the right type' : function (err, widget) {
      assert.isTrue(widget.get('exampleWidget') instanceof SubWidget);
    },
    'can get embedded widget field via path' : function (err, widget) {
      assert.equal(widget.get('exampleWidget.name'), 'example');
    },
    'can set embedded widget field via path' : function (err, widget) {
      widget.set({ 'exampleWidget.name' : 'elpmaxe' });
      assert.equal(widget.get('exampleWidget.name'), 'elpmaxe');
    }
  },
  'widget with single valid embedded widget' : {
    topic : create({ name : 'validName', exampleWidget : { } }),
    'embedded widget should not be valid' : function (err, widget) {
      assert.isFalse(widget.get('exampleWidget').isValid());
    },
    'embedded widget should have error on name': function (err, widget) {
      var example = widget.get('exampleWidget');
      example.isValid();

      // note: not using example.errors.on here b/c we need to test
      // errors.on with a full path name
      assert.equal(widget.errors.on('exampleWidget.name'), validationText);
    },
    'widget should not be valid' : function (err, widget) {
      assert.isFalse(widget.isValid());
    },
    'widget should have error on exampleWidget': function (err, widget) {
      var example = widget.get('exampleWidget');
      example.isValid();

      assert.deepEqual(widget.errors.on('exampleWidget'), example.errors);
    }
  },

  //
  // Embedded Widget Array
  //

  'widget with embedded widget array' : {
    topic : create({ examples : [{ name : 'example1' }, { name : 'example2' }] }),
    'can get embedded widget array' : function (err, widget) {
      assert.ok(widget.get('examples'));
    },
    'embedded widget array has the right type' : function (err, widget) {
      assert.isTrue(widget.get('examples') instanceof Array);
      assert.isTrue(widget.get('examples')[0] instanceof SubWidget);
    },
  },
  'widget with embedded widget array that has an invalid element' : {
    topic : create({ name : 'validName', examples : [{        }, { name : 'example2' }] }),
    'widget should not be valid' : function (err, widget) {
      assert.isFalse(widget.isValid());
    },
    'widget should have error on exampleWidget': function (err, widget) {
      assert.equal(widget.errors.on('examples'), 'Embedded array validation errors');
    }
  },

  // Field array

  'widget with array' : {
    topic : create({ name : 'validName', dataArray : [1, 2, 3] }),
    'widget should be valid' : function (err, widget) {
      assert.isTrue(widget.isValid());
    }
  }

}).addBatch({
// ---------------------------------------------------------------------------
// set function
// ---------------------------------------------------------------------------
  'widget with value' : {
    topic : create({ name : 'myName', additionalField : 'additional', exampleWidget: { name: 'nombre' } }),
    'set fields via paths' : {
      topic : function (widget) {
        return widget.set({ name : 'newName', 'exampleWidget.name' : 'nomme' });
      },
      'will update properly' : function (widget) {
        assert.equal(widget.get('name'), 'newName');
        assert.equal(widget.get('exampleWidget.name'), 'nomme');
      },
      'does not change other fields' : function (widget) {
        assert.equal(widget.get('additionalField'), 'additional');
      }
    },
    'set invalid field' : {
      topic : function (widget) {
        return widget.set({ birthdate : 'June' });
      },
      'will fail validation' : function (widget) {
        assert.isFalse(widget.isValid());
        assert.ok(widget.errors.on('birthdate'));
      }
    }
  },
  'widget with model holes' : {
    topic : create({ name : 'myName', additionalField : 'additional' }),
    'blah' : {
      topic : function (widget) {
        return widget.set({ 'exampleWidget.name' : 'bob' });
      },
      'first-level' : function (widget) {
        assert.equal(widget.get('exampleWidget.name'), 'bob');
      }
    }
  }
}).addBatch({
// ---------------------------------------------------------------------------
// unset function
// ---------------------------------------------------------------------------
  'widget with value' : {
    topic : create({ name : 'myName', additionalField : 'additional', exampleWidget: { name : 'aName' } }),
    'unset first-level field' : {
      topic : function (widget) {
        return widget.unset('name');
      },
      'will update properly' : function (widget) {
        assert.equal(widget.get('name'), null);
      },
      'does not change other fields' : function (widget) {
        assert.equal(widget.get('additionalField'), 'additional');
      }
    },
    'unset field via path' : {
      topic : function (widget) {
        return widget.unset('exampleWidget.name');
      },
      'will update properly' : function (widget) {
        assert.equal(widget.get('exampleWidget.name'), null);
      }
    }
  }
}).addBatch({
// ---------------------------------------------------------------------------
// Validation behavior
// ---------------------------------------------------------------------------
  'with invalid field in widget': {
    topic: create({}),
    'should be invalid': function (widget) {
      assert.isFalse(widget.isValid());
    },
    'should have an error on name': function (widget) {
      assert.equal(widget.errors.on('name'), validationText);
    },
  }
}).addBatch({
  'with invalid base record widget': {
    topic: create({ name : 'Valid Name', setForError : true }),
    'should be invalid': function (widget) {
      assert.isFalse(widget.isValid());
    },
    'should have an error on base': function (widget) {
      assert.equal(widget.errors.on_base(), 'base error');
    },
    'should not have an error on name': function (widget) {
      assert.isNull(widget.errors.on('name'));
    },
  }
}).addBatch({
  'with two invalid params': {
    topic: create({ name : 'ab', setForError : true }),
    'should be invalid': function (widget) {
      assert.isFalse(widget.isValid());
    },
    'should have an error on base': function (widget) {
      assert.equal(widget.errors.on_base(), 'base error');
    },
    'should have an error on name': function (widget) {
      assert.equal(widget.errors.on('name'), validationText);
    },
    'should have two errors': function (widget) {
      assert.equal(widget.errors.count(), 2);
    },
  }
}).export(module);