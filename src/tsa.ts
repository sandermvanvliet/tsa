/// <reference path="../typings/main.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />

var vorpal = require('vorpal')();

vorpal
  .command('foo', 'Outputs "bar".')
  .action(function(args, callback) {
    this.log('bar');
    callback();
  });

vorpal
  .show()
  .parse(process.argv);