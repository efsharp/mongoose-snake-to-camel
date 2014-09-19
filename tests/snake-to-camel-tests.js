var expect = require('expect.js'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Types = mongoose.Schema.Types,
	snakeToCamelPlugin = require('../');

describe('Snake-to-camel', function() {
	describe('with default options', function() {
		var Model;

		beforeEach(function() {
			var childSchema = new Schema({
				meh_boo: { type: Types.Mixed }
			});

			var schema = new Schema({
				_hello: { type: Types.Mixed },
				foo_bar: { type: Types.Mixed },
				what__is___this: { type: Types.Mixed },
				lolz: { type: Types.Mixed },
				asdf: [ childSchema ]
			});

			childSchema.plugin(snakeToCamelPlugin, {});
			schema.plugin(snakeToCamelPlugin, {});

			var connection = mongoose.createConnection();
			Model = mongoose.Model.compile('FooBar', schema, 'foobar', connection);
		});

		it('should not create virtual properties for mongoose/mongo internals', function() {
			var instance = new Model();
			expect(instance).to.have.property('_id');
			expect(instance).to.have.property('__v');
			expect(instance).to.not.have.property('v');
		});

		it('should create virtual properties for snake case properties', function() {
			var instance = new Model();
			instance.whatIsThis = 'bar';
			expect(instance).to.have.property('what__is___this', 'bar');
			expect(instance).to.have.property('whatIsThis', 'bar');
		});

		it('should create virtual properties for snake case properties with lots of consecutive underscores', function() {
			var instance = new Model();
			instance.fooBar = 'bar';
			expect(instance).to.have.property('foo_bar', 'bar');
			expect(instance).to.have.property('fooBar', 'bar');
		});

		it('should set virtual properties from camelCase properties constructor', function() {
			var instance = new Model({
				fooBar: 'bar'
			});
			expect(instance).to.have.property('foo_bar', 'bar');
			expect(instance).to.have.property('fooBar', 'bar');
		});

		it('should set virtual properties from snake_case properties constructor', function() {
			var instance = new Model({
				foo_bar: 'bar'
			});
			expect(instance).to.have.property('foo_bar', 'bar');
			expect(instance).to.have.property('fooBar', 'bar');
		});

		it('should create clean object without snake-case properties', function() {
			var instance = new Model();
			instance.fooBar = 'asdf';
			instance.asdf.push({ mehBoo: 'meh' });
			instance.hello = 'world';

			var clean = instance.toCleanObject();
			expect(clean).to.have.property('fooBar', 'asdf');
			expect(clean).to.not.have.property('foo_bar');
			expect(clean).to.not.have.property('_hello');
			expect(clean).to.have.property('hello', 'world');
			expect(clean).to.have.property('asdf');
			expect(clean).to.have.property('id');
			expect(clean).to.not.have.property('_id');
			expect(clean.asdf).to.have.length(1);
			expect(clean.asdf[0]).to.not.have.property('meh_boo');
			expect(clean.asdf[0]).to.have.property('mehBoo', 'meh');
			expect(clean.asdf[0]).to.have.property('id');
			expect(clean.asdf[0]).to.not.have.property('_id');
		});

		it('should create clean object with nulls', function() {
			var instance = new Model();
			instance.lolz = null;

			var clean = instance.toCleanObject();
			expect(clean).to.have.property('lolz', null);
		});
	});

	describe('with predefined virtual types', function() {
		var Model;

		function createGetter() {
			var counter = 0;
			return function() {
				return ++counter;
			}
		}

		function createSetter() {
			return function() {};
		}

		it('should not override getters and setters if they are already defined', function() {
			var schema = new Schema({
				foo_bar: { type: Types.Mixed }
			});

			schema.virtual('fooBar')
				.get(createGetter())
				.set(createSetter());

			schema.plugin(snakeToCamelPlugin, {});

			var connection = mongoose.createConnection();
			Model = mongoose.Model.compile('FooBar', schema, 'foobar', connection);

			var instance = new Model();
			expect(instance.fooBar).to.equal(1);
			instance.fooBar = 'bar';
			expect(instance.fooBar).to.equal(2);
		});

		it('should create getters and setters if they are not already defined', function() {
			var schema = new Schema({
				foo_bar: { type: Types.Mixed }
			});

			schema.virtual('fooBar');

			schema.plugin(snakeToCamelPlugin, {});

			var connection = mongoose.createConnection();
			Model = mongoose.Model.compile('FooBar', schema, 'foobar', connection);

			var instance = new Model();
			instance.fooBar = 'bar';
			expect(instance).to.have.property('fooBar', 'bar');
			expect(instance).to.have.property('foo_bar', 'bar');
		});
	});
});