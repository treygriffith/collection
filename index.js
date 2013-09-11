var Collection = require('./lib/collection')
  , buffer = require('buffer');


/**
 * Plugin.
 *
 * @param {Function} values  The Model.
 */

module.exports = function (Model) {
  
  /**
   * Add a collection to this Model
   *
   * @param {String} name Name of the collection (this will be used as the basis for the attribute name)
   * @param {Function} Constructor The model constructor of the members of this collection
   * @param {Object} options Optional object of options for the collection
   */

  Model.collection = function (name, Constructor, options) {

    options = options || {};

    this.attr(name, options);

    this.on('construct', function (model) {
      createCollection(model, name, Constructor, options);
    });

    return this;
  };
};

/**
 * Instantiate a new collection at the specified attribute
 *
 * @param {Object} model model instance to add the collection to
 * @param {String} name Name of the attribute where the model lives
 * @param {Function} Constructor The model constructor of the members of the collection
 * @api private
 */

function createCollection (model, name, Constructor, options) {

  options = options || {};
  model.attrs[name] = model.attrs[name] || [];

  var collection = new Collection();
  collection.Model = Constructor;
  collection.model = model;
  collection.name = name;

  model[name] = function (val) {
    if (arguments.length == 0) return collection;
    collection.replace(val);
  };

  model.on('saving', function () {
    if (options.updateChangedModels !== false) collection.updateChangedModels();
    if (options.saveNewModels !== false) collection.saveNewModels();
  });

  bubbleChanges(collection, ['add', 'remove', 'placeholder']);

  if (options.saveOnPlaceholder) {
    collection.on('placeholder', buffer(function () {
      model.save();
    }, 100));
  }

  return collection;
}

/**
 * Bubble `events` on the collection into `change` events on the Model attribute
 * @param  {Object} collection Collection to listen to for events
 * @param  {Array} events     Array of strings with events to listen for
 * @api private
 */

function bubbleChanges(collection, events) {

  var model = collection.model
    , Model = model.model;

  events.forEach(function (event) {

    collection.on(event, function () {
      var val = model.attrs[name];
      model.dirty[name] = val;
      Model.emit('change', model, name, val, val);
      Model.emit('change ' + name, model, val, val);
      model.emit('change', name, val, val);
      model.emit('change ' + name, val, val);
    });

  });
}