Package.describe({
	summary: 'Adds collection for storing and editing docs before insertion'
});

var both = ["client", "server"];

Package.on_use(function(api, where) {
	api.use([
    "meteor",
    "underscore",
    "ejson",
    "mongo-livedata",
    "minimongo",
    "deps"
  ], both);
	
	if (api.export) {
		api.export('TempDocs', both);
	}

	api.add_files([
		'lib/helpers.js',
		'tempdocs.js',
	], both);
});