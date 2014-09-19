# mongoose-snake-to-camel
[![Build Status](https://travis-ci.org/tmont/mongoose-snake-to-camel.png)](https://travis-ci.org/tmont/mongoose-snake-to-camel)
[![NPM version](https://badge.fury.io/js/mongoose-snake-to-camel.png)](http://badge.fury.io/js/mongoose-snake-to-camel)

A [Mongoose](http://mongoosejs.com/) plugin that creates camelCase aliases (virtuals) for
snake_case properties.

## Installation
```
npm install mongoose-snake-to-camel
```

## Usage
```javascript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    snakeToCamel = require('mongoose-snake-to-camel');

var schema = new Schema({
    _hello: { type: Schema.Types.Mixed },
    doNotChange: { type: Schema.Types.Mixed },
    foo_bar: { type: Schema.Types.Mixed },
    what__is___this: { type: Schema.Types.Mixed }
});

schema.plugin(snakeToCamel);

var Thing = mongoose.model('Thing', schema);
var thing = new Thing({
    fooBar: 'foo bar'
});

console.log(thing.fooBar); //"foo bar"
console.log(thing.foo_bar); //"foo bar"

thing.whatIsThis = 'snakes';

console.log(thing.what__is___this); //"snakes"
console.log(thing.whatIsThis); //"snakes"

console.log('hello' in thing); //true

console.dir(thing.toCleanObject());
/*
{
    id: ..., //_id is converted to id automatically
    hello: ...,
    fooBar: ...,
    doNotChange: ...,
    whatIsThis: ...
}
*/
```
