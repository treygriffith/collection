describe('model-collection', function () {

  var collection = require('model-collection')
    , assert = require('component-assert')
    , model = require('segmentio-model')
    , type = require('component-type');


  it('should add a collection as an attribute of arrays to a model', function () {

    var Todo = model('todo');

    var User = model('user')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();

    user.todos([]);

    assert(user.todos() instanceof Todo);
    assert(type(user.attrs.todos) === 'array');
  });

});
