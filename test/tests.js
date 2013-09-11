describe('model-setters', function () {

  var setters = require('model-setters')
    , assert = require('component-assert')
    , model = require('segmentio-model')
    , type = require('component-type');


  it('should send all set operations through the setter', function () {

    var Order = model('order')
      .use(setters)
      .attr('amount', { set: function (amt) {
        amt = amt.replace(/[^0-9\.]+/g, '');
        return Math.round(parseFloat(amt) * 100);
      } });

    var order = new Order();

    order.amount('$50');

    assert(5000 === order.amount());
  });

  it('should send all get operations through the getter', function () {

    var Ninja = model('ninja')
      .use(setters)
      .attr('battleCry', { get: function (cry) { return cry ? cry.toUpperCase() : cry; }});

    var ninja = new Ninja();

    ninja.battleCry("whoop");

    assert("WHOOP", ninja.battleCry());
  });

  it('should accept all defaults up front', function () {
    var Ninja = model('ninja')
      .use(setters({
        visibility : {
          set: function (pct) {
            return parseInt(pct, 10) / 100;
          },
          get: function (dec) {
            return (dec * 100).toFixed(2) + '%';
          }
        },
        belt : {
          get: function (belt) {
            return 'ninja ' + belt;
          }
        }
      }))
      .attr('visibility')
      .attr('belt');

    var ninja = new Ninja();

    ninja.visibility('50%');
    assert(ninja.attrs.visibility === 0.5);
    assert(ninja.visibility() === '50.00%');

    ninja.belt('black');
    assert(ninja.belt() === 'ninja black');
  });

  it('should call setters and getters in the context of the model', function () {

    var Dog = model('dog')
      .use(setters)
      .attr('age', { set: function (age) { return parseInt(age, 10); } })
      .attr('bark', { get: function (bark) {
        if(this.age() < 2) return bark.toUpperCase();
        return bark;
      } });

    var spot = new Dog({ bark: 'woof' });

    spot.age('1');

    assert(spot.bark() === 'WOOF');

    var sparky = new Dog({ bark: 'ruff', age: 7 });

    assert(sparky.bark() === 'ruff');
  });

});
