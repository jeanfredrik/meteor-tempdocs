var _transform = function(doc) {
	return _.omit(doc, '_id');
}

var collection = new Mongo.Collection(null);
TempDocs = new Mongo.Collection(null);

var _options = {};

TempDocs.deny({
	'insert': function() {
		return true;
	},
	'update': function() {
		return true;
	},
	'remove': function() {
		return true;
	},
})

TempDocs.options = function(selector) {
	if(!_.isString(selector)) throw 'Selector must be a document _id';
	_options[selector] = _options[selector] || {};
	var args = _.rest(arguments);
	if(args.length == 0) {
		return _options[selector] || {};
	} else if(args.length == 1) {
		if(_.isString(args[0])) {
			return (_options[selector] || {})[args[0]];
		} else {
			_.extend(_options[selector], args[0])
		}
	} else {
		if(_.isString(args[0])) {
			if(!_options[selector]) _options[selector] = {};
			_options[selector][args[0]] = args[1];
		}
	}
}

TempDocs.update = function(selector, modifier, options, callback) {
	var args = _.toArray(arguments);
	if(!_.isString(selector)) throw 'Selector must be a document _id';
	return collection.update(selector, modifier, options, callback);
};

TempDocs.findOne = function(selector, options) {
	var args = _.toArray(arguments);
	if(!_.isString(selector)) throw 'Selector must be a document _id';
	var doc = collection.findOne(selector);
	if(!doc) {
		collection.insert({_id: selector});
		console.info('TempDoc: A document with id "%s" was automatically created', selector);
		doc = collection.findOne(selector);
	}
	var transform = (options && options.transform && _.isFunction(options.transform) && options.transform) || (TempDocs.options(selector, 'transform')) || _.identity;
	return transform(_transform(doc));
};

TempDocs.remove = function(selector, callback) {
	var args = _.toArray(arguments);
	if(!_.isString(selector)) throw 'Selector must be a document _id';
	return collection.remove(selector, callback);
};

TempDocs._collection = collection;