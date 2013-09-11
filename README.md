# model-setters

  Lets a model specify custom getters and setters for attributes.

## Installation

    $ component install treygriffith/model-setters

## API

```js
var defaults = require('model-setters')
  , model = require('model');

// all specified up front
var person = model('person')
  .use(setters({
    name: {
      get: function (name) {
        return name.toUpperCase();
      },
      set: function (name) {
        return name.toLowerCase();
      }
    },
    age: {
      set: function (age) {
        return parseInt(age, 10);
      }
    } 
  }))
  .attr('name')
  .attr('age');

// or specified individually
var person = model
  .use(setters)
  .attr('name', {
    get: function (name) { return name.toUpperCase(); }
    set: function (name) { return name.toLowerCase(); }
  })
  .attr('age', { set: function (age) { return parseInt(age, 10); } });
```

## License

  MIT