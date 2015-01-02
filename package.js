Package.describe({
  name: 'jeanfredrik:tempdocs',
  summary: 'Handle local temporary documents before insertion with the TempDocs collection',
  version: '0.1.1',
  git: 'https://github.com/jeanfredrik/meteor-tempdocs.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('mongo', 'client');
  api.use('underscore', 'client');

  api.addFiles('client.js', 'client');

  api.export('TempDocs');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('jeanfredrik:tempdocs');
  api.addFiles('tests.js');
});
