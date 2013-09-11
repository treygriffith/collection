describe('collection', function () {

  var collection = require('collection')
    , assert = require('component-assert')
    , model = require('segmentio-model')
    , type = require('component-type');

  it('should add a collection as an attribute of arrays to a model', function () {

    var Todo = model('todo');

    var User = model('user')
      .use(collection)
      .attr('id')
      .collection('todos', Todo);

    var user = new User();

    user.todos([]);

    assert(type(user.todos()) !== 'array');
    assert(type(user.attrs.todos) === 'array');
  });

  it('should create a new instance of the model when an attribute object is added', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();

    user.todos().add({
      name: "something",
      content: "something else"
    });

    assert(user.todos().first() instanceof Todo);
    assert(user.todos().first().name() === "something");
  });

  it('should keep an existing instance of a model that is added', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();
    var todo = new Todo({
      name: "something",
      content: "something else"
    });

    user.todos().add(todo);

    assert(user.todos().first() === todo);
  });

  it('should add the primary key to the model\'s attributes', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();
    var todo = new Todo({
      id: 1,
      name: "something",
      content: "something else"
    });

    user.todos().add(todo);

    assert(user.attrs.todos[0] === 1);
  });

  it('should remove a model from the collection', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();
    var todo = new Todo({
      id: 1,
      name: "something",
      content: "something else"
    });

    user.todos().add(todo);

    user.todos().remove(todo);

    assert(user.todos().length() === 0);
    assert(user.attrs.todos.length === 0);
  });

  it('should update existing models while adding new ones in the right place', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();
    var todo = new Todo({
      id: 1,
      name: "something",
      content: "something else"
    });

    user.todos().add(todo);

    user.todos([{
      id: 2,
      name: "Something",
      content: "blah"
    },
    {
      id: 1,
      name: "something else",
      content: "blu"
    }]);

    assert(user.todos().length() === 2);
    assert(user.todos().first().id() === 2);
    assert(user.todos().last() === todo);
    assert(user.attrs.todos.length === 2);
    assert(user.attrs.todos[0] === 2);
    assert(user.attrs.todos[1] === 1);
  });

  it('removes destroyed models from the collection', function () {

    var Todo = model('todo')
      .attr('id')
      .attr('name')
      .attr('content');

    var User = model('user')
      .attr('id')
      .use(collection)
      .collection('todos', Todo);

    var user = new User();

    user.todos([{
      id: 2,
      name: "Something",
      content: "blah"
    },
    {
      id: 1,
      name: "something else",
      content: "blu"
    }]);

    user.todos().last().emit('removing');

    assert(user.todos().length() === 1);
    assert(user.todos().first().id() === 2);
  });


});
