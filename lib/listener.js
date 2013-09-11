
/**
 * Listen to a model's events to adjust the corresponding collection
 * @param  {Object} collection Collection with the model in it
 * @param  {Object} model      Model in the collection
 * @return {Object}            Model listened to
 */

exports.start = function (collection, model) {

  model.on('remove', onRemove(collection, model));

  model.on('change', onChange(collection, model));

  return model;
};

/**
 * Stop listening to events on the model to adjust the collection
 * @param  {Object} collection Collection that no longer is affected by the `model`
 * @param  {OBject} model      Model to stop listening to
 * @return {Object}            model no longer listened to
 */

exports.stop = function (collection, model) {

  ['remove', 'change'].forEach(function (event) {

    model.listeners(event).forEach(function (fn) {
      if(fn.listener === collection) model.off(event, fn);
    });
  });

  return model;
};

/**
 * Generate an onRemove callback
 * @param  {Object} collection Collection that is listening to the model
 * @param  {Object} model      Model that is being listened to
 * @return {Function}            Listener to attach to the Model
 */

function onRemove (collection, model) {

  var fn = function () {
    collection.remove(model);
  };

  fn.listener = collection;

  return fn;
}

/**
 * Generate an onChange callback
 * @param  {Object} collection Collection that is listening to the model
 * @param  {Object} model      Model that is being listened to
 * @return {Function}            Listener to attach to the Model
 */
function onChange (collection, model) {

  var fn = function (key, val, prev) {
    if(key === model.model.primaryKey) {
      var i = collection.indexOf(model);
      if (~i) collection.model[colleciton.name]().splice(i, 1, val);
    }
  };

  fn.listener = collection;

  return fn;
}