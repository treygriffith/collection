
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , Enumerable = require('enumerable')
  , asyncEach = require('async-each')
  , each = require('each')
  , listener = require('./listener')
  , sgen = require('sgen')
  , noop = function () {};

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Mixin enumerable.
 */

Enumerable(exports);

/**
 * Iterator implementation.
 */

exports.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.length() },
    get: function(i){ return self.models[i] }
  }
};

/**
 * Return the collection length.
 *
 * @return {Number}
 * @api public
 */

exports.length = function(){
  return this.models.length;
};

/**
 * Add `model` at index `position` in the collection and return the model
 * @param {Number} position index of the model in the collection
 * @param {Object} model    model to be added
 * @return {Object} model added
 * @api public
 */
exports.addAt = function(position, model) {

  if (!(model instanceof this.Model)) model = new this.Model(model);

  var key = model.primary();

  if(!key) key = this.placeholder(model);

  this.models.splice(position, 0, model);
  this.model.attrs[this.name].splice(position, 0, key);

  listener.start(this, model);

  this.emit('add', model);

  return model;
};

/**
 * Add `model` to the end of collection and return the new length of the collection.
 *
 * @param {Object} model
 * @return {Number}
 * @api public
 */

exports.add =
exports.push = function(model){

  this.addAt(this.length(), model);

  return this.length();
};

/**
 * Remove `model` from the collection, returning `true` when present,
 * otherwise `false`.
 *
 * @param {Object} model
 * @api public
 */

exports.remove = function(model){
  var i = this.indexOf(model);
  if (~i) {
    this.model.attrs[this.name].splice(i, 1);
    this.models.splice(i, 1);
    listener.stop(this, model);
    this.emit('remove', model);
  }
  return !! ~i;
};

/**
 * Replace all of the models in the collection
 *
 * @param {Array} ids Array of ids or objects of the new models to populate the collection
 * @param {Function} callback function evaluated once the collection has had all models replaced
 * @api public
 */

exports.replace = function (ids, callback) {

  callback = callback || noop;

  var collection = this
    , Model = this.Model;

  getModels(Model, ids, function (err, newModels) {

    if (err) return callback(err);

    callback(null, replaceModels(collection, newModels));

  });

  return this;
};

/**
 * Generate a placeholder primary key until the model is saved
 * @param  {Object} model model to generate a primary key for
 * @return {String}       placeholder primary key
 * @api public
 */

exports.placeholder = function (model) {

  var collection = this
    , key = sgen.timestamp() + sgen.random();

  model.once('save', function () {

    var keys = collection.model[collection.name]();

    keys.splice(keys.indexOf(key), 1, model.primary());

    // should this trigger a save in the parent?
    collection.emit('placeholder', model);
  });

  return key;
};

/**
 * Retrive an array of models from an array of ids
 * @param  {Function}   Model    Model constructor for these ids
 * @param  {Mixed}   ids      String ids of the models, or the objects representing model attributes
 * @param  {Function} callback Function to be evaluated with the array once retrieved
 * @api private
 */

function getModels (Model, ids, callback) {

  asyncEach(ids, function (id, cb) {

    if (typeof id === 'string') {
      return Model.request(Model.url(id), function (res) {

        if(res.error) return cb(new Error('got ' + res.status + ' response'));

        cb(null, res.body);
      });
    }

    cb(null, id);
  }, callback);
}

/**
 * Replace the models in `collection` with the objects in array `newModels`
 * @param  {Object} collection Collection of models
 * @param  {Array} newModels  Array of objects that have model attributes
 * @api private
 */

function replaceModels (collection, newModels) {

  var notFound = collection.models.slice();

  each(newModels, function (newModel, i) {

    if(newModel instanceof collection.Model) newModel = newModel.attrs;

    var model = collection.find(findModel(newModel));

    if (model) {
      notFound.splice(notFound.indexOf(model), 1);
      return model.set(newModel);
    }

    collection.addAt(i, newModel);
  });

  if (notFound.length) notFound.forEach(function (model) {
    collection.remove(model);
  });

  return collection;
}

/**
 * Generate a comparision function for Collection#find to find by primary key
 * @param  {Object} toFind Attributes of the model to find.
 * @return {Function}          Comparision function for Collection#find
 * @api private
 */

function findModel (toFind) {
  return function (model) {
    return model.primary() === toFind[model.model.primaryKey];
  };
}
