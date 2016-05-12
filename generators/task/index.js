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
        },

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
        }
    },

    default: {
        saveConfig: function () {
        }
    },

    writing: {
        task: function () {
            // create directory...
            var taskFullPath = path.join.apply(null, [CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES].concat(_.split(this.taskNamespace, '.')));
            mkdirp(taskFullPath);
            this.logCreate(taskFullPath);

            var scriptName = _.upperFirst(_.camelCase(this.taskName));
            var utilsScriptName = scriptName + 'Utils';

            this.fs.copyTpl(
                this.templatePath('_utils.py'),
                this.destinationPath(path.join(taskFullPath, `${utilsScriptName}.py`)),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('_PythonScript.py'),
                this.destinationPath(path.join(taskFullPath, `${scriptName}.py`)),
                {
                    taskNamespace: this.taskNamespace,
                    utilsScriptName: utilsScriptName
                }
            );

            this.fs.copy(
                this.templatePath('__init__.py'),
                this.destinationPath(path.join(taskFullPath, '__init__.py'))
            );

            var testNamespaceModules = _.map(_.split(this.taskNamespace, '.'), function (ns) {
                return 'test_' + ns;
            });
            var taskTestFullPath = path.join.apply(null, [CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT].concat(testNamespaceModules));
            mkdirp(taskTestFullPath);
            this.logCreate(taskTestFullPath);
            this.fs.copyTpl(
                this.templatePath('_utilsTest.py'),
                this.destinationPath(path.join(taskTestFullPath, `test_${utilsScriptName}.py`)),
                {
                    taskNamespace: this.taskNamespace,
                    utilsScriptName: utilsScriptName,
                    testName: 'Test' + scriptName
                }
            );
            this.fs.copy(
                this.templatePath('__init__.py'),
                this.destinationPath(path.join(taskTestFullPath, '__init__.py'))
            );

            var config = {
                path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
                file: 'synthetic.xml',
                type: [
                    '',
                    `<type type="${this.taskNamespace}.${scriptName}" extends="${this.baseType}">`,
                    '    <!-- Add task properties here -->',
                    '    <property category="input" name="greetingName" kind="string" label="Your name" description="The name to say hello to." />',
                    '    <property category="output" name="message" kind="string" description="The printed greeting." />',
                    '</type>'
                ]
            };

            xlrUtil.appendType(config);
        }
    }
});
