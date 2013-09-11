
# collection

  Collections that are part of models in the form of `component/model`.

## API

### Add a collection to a model

```js
var model = require('model')
  , collections = require('collection');

var Todo = model('todo')
  .attr('title')
  .attr('text')
  .attr('status')

var User = model('user')
  .use(collections)
  .attr('name')
  .collection('todos', Todo);

```

### Add Models to a collection

```js
var user = new User({
  name: "Bob"
});

user.todos().add({
  title: "My New Item",
  text: "So much to do"
});

var todo = new Todo({
  title: "My other item",
  text: "things are looking up!"
});

user.todos().add(todo);

```

### Remove models from a collection

```js
user.todos().remove(user.todos().first());

user.todos().first().destroy();

```

### Replace all the models in a collection

```js
user.todos(['todo_id1', 'todo_id2']);
user.todos([{title: 'Title 1'}, {title: 'Title 2'}]);
user.todos([todo1, todo2]);

```


## Plugins

Use plugins by calling `collection.use(plugin)` prior to `model().use(collection)`.

For an example of a plugin, see [treygriffith/collection-save](http://github.com/treygriffith/collection-save), which adds methods to assist with automatically saving collection members

## Testing

```
$ make test
```

# License

  MIT