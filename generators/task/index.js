// Task subgenerator
var fs = require('fs');
var path = require('path');
var util = require('util');
var generators = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var CONSTANTS = require('../constants');
var BaseGenerator = require('../base-generator');
var xlrUtil = require('../util');

var XlrGenerator = generators.Base.extend({});
util.inherits(XlrGenerator, BaseGenerator);

module.exports = XlrGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.testFrameworks = [];
        this.baseType = 'xlrelease.PythonScript';
    },

    initializing: {
        loadConfig: function () {
            this.namespace = this.config.get('namespace');
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
                default: this.namespace,
                store: false
            }, (answers => {
                this.taskNamespace = answers.taskNamespace;
                this.taskPath = _.replace(this.taskNamespace, '.', '/');
                done();
            }).bind(this));
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
            this.logCreate(taskFullPath);

            var scriptName = _.upperFirst(_.camelCase(this.taskName));
            this.fs.copyTpl(
                this.templatePath('_PythonScript.py'),
                this.destinationPath(`${path.join(taskFullPath, scriptName)}.py`),
                {}
            );

            var config = {
                path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
                file: 'synthetic.xml',
                type: [
                    `<type type="${this.taskNamespace}.${scriptName}" extends="${this.baseType}">`,
                    '    <!-- Add task properties here -->',
                    '</type>'
                ]
            };

            xlrUtil.appendType(config);
        }
    }
});
