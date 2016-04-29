// Task subgenerator
var fs = require('fs');
var path = require('path');
var generators = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var CONSTANTS = require('../constants');
var util = require('../util');

module.exports = generators.Base.extend({
  constructor: function ()  {
    generators.Base.apply(this, arguments);
    this.testFrameworks = [];
    this.baseType = 'xlrelease.PythonScript';
  },

  initializing: {
    loadConfig: function () {
      this.testFrameworks = this.config.get('testFrameworks');
    }
  },

  prompting: {
    taskName: function () {
      var done = this.async();
      this.prompt({
        type: 'input',
        name: 'taskName',
        message: 'Task name',
        store: false
      }, (answers => {
        this.taskName = answers.taskName;
        done();
      }).bind(this));
    },

    taskNamespace: function () {
      var done = this.async();
      this.prompt({
        type: 'input',
        name: 'taskNamespace',
        message: 'Task namespace',
        store: false
      }, (answers => {
        this.taskNamespace = answers.taskNamespace;
        this.taskPath = _.replace(this.taskNamespace, '.', '/');
        done();
      }).bind(this));
    },

    // baseType: function () {
    //   var done = this.async();
    //   this.prompt({
    //     type: 'list',
    //     name: 'baseType',
    //     message: 'Choose task base type',
    //     choices: CONSTANTS.BASE_TASK_TYPES,
    //     store: true
    //   }, (answers => {
    //     this.baseType = answers.baseType;
    //     done();
    //   }).bind(this));
    // },

    virtual: function () {
      var done = this.async();
      this.prompt({
        type: 'confirm',
        name: 'virtual',
        message: 'Is task virtual?',
        default: false
      }, (answers => {
        this.virtual = answers.virtual;
        done();
      }));
    }
  },

  default: {
    saveConfig: function () {
    }
  },

  writing: {
    task: function () {
      // create directory...
      var taskFullPath = path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, this.taskPath);
      mkdirp(taskFullPath);

      var scriptName = _.upperFirst(_.camelCase(this.taskName));
      this.fs.copyTpl(
        this.templatePath('_PythonScript.py'),
        this.destinationPath(`${path.join(taskFullPath, scriptName)}.py`),
        { }
      );

      var config = {
        path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
        file: 'synthetic.xml',
        type: [
          `<type type="${this.taskNamespace}.${scriptName}"${this.virtual ? ' virtual="true"'  : ''} extends="${this.baseType}">`,
          _.repeat(' ', 4) + '<!-- Add task properties here! -->',
          '</type>'
        ]
      };

      util.appendType(config);
    }
  }
});
