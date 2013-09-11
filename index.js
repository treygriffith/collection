var proto = require('./lib/proto')
  , Emitter = require('emitter');

/**
 * Plugin.
 *
 * @param {Function} values  The Model.
 */

var collections = module.exports = function (Model) {
  return bind(Model, this.plugins || collections.plugins);
};

/**
 * Use a plugin
 * @param  {Function} plugin Plugin to apply to collections created
 * @return {Function}        new collections plugin
 */
collections.use = function (plugin) {
  return this.bind({ plugins: this.plugins.concat(plugin), use: this.use });
};

collections.plugins = [];

function bind(Model, plugins) {
  
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

    var Collection = createCollection(name, Constructor, options);

    plugins.forEach(function(fn) {
      Collection.use(fn);
    });

    this.on('construct', function (model) {
      new Collection(model, options);
    });

    return this;
  };

  return Model;
}

function createCollection (name, Constructor) {

  /**
   * Initialize a new collection on `model`.
   *
   * @param {Object} model
   * @param {Options} options options for initializing the collection
   * @api public
   */
  
  function Collection(model, options) {
    var collection = this;

    this.model = model;
    this.models = [];
    this.options = options = options || {};
    model.attrs[name] = model.attrs[name] || [];

    model[name] = function (val) {
      if (arguments.length == 0) return collection;
      collection.replace(val);
    };

    bubbleChanges(collection, ['add', 'remove', 'placeholder']);

    this.replace(model.attrs[name]);
    this.collection.emit('construct', this, this.models);

    return this;
  }

  Collection.collectionName = name;
  Collection.Model = Constructor;

  Emitter(Collection);

  /**
   * Use the given plugin `fn()`.
   *
   * @param {Function} fn
   * @return {Function} self
   * @api public
   */

  Collection.use = function(fn) {
    fn(this);
    return this;
  };

  Collection.prototype = {};
  Collection.prototype.collection = Collection;
  Collection.prototype.name = name;
  Collection.prototype.Model = Constructor;
  for(var key in proto) Collection.prototype[key] = proto[key];

  return Collection;
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