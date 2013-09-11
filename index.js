var Collection = require('./lib/collection');


/**
 * Plugin.
 *
 * @param {Function} values  The Model.
 */

module.exports = function (Model) {
  return bind(Model);
};


/**
 * Add a `.collection` method to the Model
 *
 * @param {Function} Model  The model constructor.
 */

function bind (Model) {

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

}

/**
 * Instantiate a new collection at the specified attribute
 *
 * @param {Object} model model instance to add the collection to
 * @param {String} name Name of the attribute where the model lives
 * @param {Function} Constructor The model constructor of the members of the collection
 */

function createCollection (model, name, Constructor, options) {

  options = options || {};
  model.attrs[name] = model.attrs[name] || [];

  var collection = new Collection();

  ['add', 'remove'].forEach(function (event) {

    collection.on(event, function () {
      var val = model.attrs[name];
      model.dirty[name] = val;
      model.model.emit('change', model, name, val, val);
      model.model.emit('change ' + name, model, val, val);
      model.emit('change', name, val, val);
      model.emit('change ' + name, val, val);
    });

  });

  model[name] = function (val) {
    if(arguments.length == 0) return collection;
    collection.replace(val);
  };

  model.on('saving', function () {

    if(options.saveChangedModels !== false) {
      collection
        .select(function (model) {
          return !!Object.keys(model.dirty).length && !model.isNew();
        })
        .each(function (model) {
          model.update();
        });
    }

    if(options.saveNewModels !== false) {
      collection
        .select(function (model) {
          return model.isNew();
        })
        .each(function (model) {
          model.save();
        });
    }

  });

  collection.Model = Constructor;
  collection.model = model;
  collection.name = name;
}