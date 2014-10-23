function underscoreToCamelCase(string) {
	return string
		.replace(/^_+/, '')
		.replace(/_+([a-z])/g, function(_, char) {
			return char.toUpperCase();
		});
}

module.exports = function(schema) {
	var internals = {
		__v: 1,
		_bsontype: 1
	};

	function shouldIgnore(pathName) {
		return pathName in internals;
	}

	schema.methods.toCleanObject = function() {
		var obj = this.toJSON();

		//using toObject({ virtuals: true }) just creates a bunch of duplicates
		//and requires more cleanup

		function clean(obj) {
			if (Array.isArray(obj)) {
				obj.forEach(function(value) {
					clean(value);
				});
				return;
			}

			//typeof(null) === 'object', so be careful!
			if (!obj || typeof(obj) !== 'object') {
				return;
			}

			//if this property is snake_case'd, then convert it to camel case
			Object.keys(obj).forEach(function(key) {
				if (!(key in obj)) {
					return;
				}

				if (shouldIgnore(key)) {
					delete obj[key];
					return;
				}

				var camelKey = underscoreToCamelCase(key);
				if (key !== camelKey) {
					obj[camelKey] = obj[key];
					delete obj[key];
				}
			});

			//clean the camelCased properties that are remaining
			Object.keys(obj).forEach(function(key) {
				clean(obj[key]);
			});
		}

		clean(obj);
		return obj;
	};

	return schema.eachPath(function(pathName) {
		if (shouldIgnore(pathName)) {
			return;
		}

		var camelCase = underscoreToCamelCase(pathName);
		if (camelCase === pathName) {
			return;
		}

		//virtualpath() returns a virtualtype, virtual() creates one and returns it
		var virtual = schema.virtualpath(camelCase) || schema.virtual(camelCase),
			hasGetters = virtual.getters.length > 0,
			hasSetters = virtual.setters.length > 0;

		if (!hasGetters) {
			schema.virtual(camelCase).get(function() {
				return this[pathName];
			});
		}

		if (!hasSetters) {
			schema.virtual(camelCase).set(function(value) {
				this[pathName] = value;
				return value;
			});
		}
	});
};

