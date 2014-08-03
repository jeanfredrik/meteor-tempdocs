function modifySelector(selector) {
	if(!_.isObject(selector)) {
		selector = {
			__tempdoc_name: selector
		};
	}
	selector.__tempdoc_userId = getUserId();
	return selector;
}

var collection = TempDocs = new Meteor.Collection('tempdocs');

var _find = collection.find;

var registeredDocs = {};

collection.register = function(name, options) {
	registeredDocs[name] = _.extend(registeredDocs[name] || {}, options);
}

collection.find = _.wrap(collection.find, function(func, selector, options) {
	var args = _.rest(arguments);
	selector = args[0] = modifySelector(selector);
	
	if(!selector.__tempdoc_userId) {
		return null;
	}
	
	options = options || {};
	
	var transform = options.transform
		|| (registeredDocs[selector.__tempdoc_name] && registeredDocs[selector.__tempdoc_name].transform)
		|| _.identity;
		
	options.transform = function(doc) {
		var args = _.toArray(arguments);
		doc = _.omit(doc, ['__tempdoc_name', '__tempdoc_userId']);
		args[0] = doc;
		return transform.apply(this, args);
	}
	
	args[1] = options;
	
	var result = func.apply(this, args);
	return result;
});

var _findOne = collection.findOne;

collection.findOne = _.wrap(_findOne, function(func, selector, options) {
	var args = _.rest(arguments);
	selector = args[0] = modifySelector(selector);
	
	if(!selector.__tempdoc_userId) {
		return null;
	}
	
	options = options || {};
	
	
	var transform = options.transform
		|| (registeredDocs[selector.__tempdoc_name] && registeredDocs[selector.__tempdoc_name].transform)
		|| _.identity;
		
	options.transform = function(doc) {
		var args = _.toArray(arguments);
		doc = _.omit(doc, ['__tempdoc_name', '__tempdoc_userId']);
		args[0] = doc;
		return transform.apply(this, args);
	}
	
	args[1] = options;
	
	var result = func.apply(this, args);
	return result || transform({});
});

var _update = collection.update;

collection.upsert = _.wrap(collection.upsert, function(func, selector, modifier, options) {
	var args = _.rest(arguments);
	selector = modifySelector(selector);
	
	if(!selector.__tempdoc_userId) {
		return null;
	}
	
	var doc;
	if(!(doc = _findOne.call(this, selector))) {
		doc = {
			__tempdoc_userId: selector.__tempdoc_userId,
			__tempdoc_name: selector.__tempdoc_name
		}
		doc._id = _insert.call(this, doc);
	}
	
	args[0] = doc._id;
	
	var schema;
	
	if(registeredDocs[selector.__tempdoc_name] && (schema = registeredDocs[selector.__tempdoc_name].schema)) {
		schema.clean(modifier, {isModifier: isOperatorObject(modifier)});
	}
	
	var result = _update.apply(this, args);
	return result;
});

collection.update = collection.upsert;

var _insert = collection.insert;
collection.insert = function() {
	Meteor.error('Can\'t use insert on TempDocs. Use upsert instead.');
}

collection.remove = _.wrap(collection.remove, function(func, selector, options) {
	var args = _.rest(arguments);
	selector = modifySelector(selector);
	
	if(!selector.__tempdoc_userId) {
		return null;
	}
	
	var doc;
	if((doc = _findOne.call(this, selector))) {
		args[0] = doc._id;
		var result = func.apply(this, args);
		return result;
	}
});

collection.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return true;
	},
});

if(Meteor.isServer) {
	Meteor.publish('tempdocs', function() {
    return _find.call(collection, {__tempdoc_userId: this.userId});
	});
}
if(Meteor.isClient) {
	Meteor.subscribe('tempdocs');
}