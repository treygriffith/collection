
# model-collection

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

```

### Replace all the models in a collection

```js
user.todos(['todo_id1', 'todo_id2']);
user.todos([{title: 'Title 1'}, {title: 'Title 2'}]);
user.todos([todo1, todo2]);

```

### Save to database

```js
user.save(); // /users/bob => { name: "Bob", todos: ["todo_id1", "todo_id2"] }

user.todos().add({title: "Title 3"});

user.save(); // /users/bob => { name: "Bob", todos: ["todo_id1", "todo_id2", "todo_id3"] }

users.todos().first().title("Title New");

user.save(); // /todos/todo_id1 => { title: "Title New" }

user.todos().first().destroy();

user.save(); // /users/bob => { name: "Bob", todos: ["todo_id2", "todo_id3"] }

```


## Testing

```
$ make test
```

# License

  MIT