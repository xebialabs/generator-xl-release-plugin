var util = require('util');
var generators = require('yeoman-generator');
var chalk = require('chalk');

var Generator = module.exports = function Generator() {
    generators.Base.apply(this, arguments);
};

util.inherits(Generator, generators.Base);

Generator.prototype.logCreate = function (message) {
  this.log(chalk.green('create') + ' ' + message);
};

