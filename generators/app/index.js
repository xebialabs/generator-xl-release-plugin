var path = require('path');
var util = require('util');
var generators = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var chalk = require('chalk');
var CONSTANTS = require('../constants');
var BaseGenerator = require('../base-generator');


var XlrGenerator = generators.Base.extend({});
util.inherits(XlrGenerator, BaseGenerator);

module.exports = XlrGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.xlrFeatures = [];
    },

    initializing: {
        // read user input from previous session?
        readConfig: function () {
            this.pluginName = this.config.set('pluginName');
            this.kebabPluginName = this.config.set('kebabPluginName');
            this.namespace = this.config.set('namespace');
            this.xlrFeatures = this.config.set('xlrFeatures');
        }
    },

    // used to get user input... uses Inquirer.js
    prompting: {
        pluginName: function () {
            var done = this.async(); // this is not the preferred way of Inquirer but is of Yeoman?
            this.prompt({
                type: 'input',
                name: 'pluginName',
                message: 'Your plugin name',
                default: _.kebabCase(this.appname),
                store: true
            }, function (answers) {
                this.pluginName = answers.pluginName;
                this.kebabPluginName = _.kebabCase(this.pluginName);
                done();
            }.bind(this));
        },

        namespace: function () {
            var done = this.async(); // this is not the preferred way of Inquirer but is of Yeoman?
            this.prompt({
                type: 'input',
                name: 'namespace',
                message: 'Default namespace'
            }, function (answers) {
                this.namespace = answers.namespace;
                done();
            }.bind(this));
        },

        xlrFeatures: function () {
            var done = this.async();
            this.prompt({
                type: 'checkbox',
                name: 'xlrFeatures',
                message: 'What do you plan to develop as part of this plugin?',
                choices: [{
                    name: 'Tiles',
                    value: 'tiles',
                    checked: true
                }, {
                    name: 'Custom REST endpoints',
                    value: 'rest',
                    checked: true
                }],
                store: false
            }, function (answers) {
                this.xlrFeatures = answers.xlrFeatures;
                done();
            }.bind(this));
        }
    },

    configuring: {},

    default: {
        // save user input for future?
        saveConfig: function () {
            this.config.set('pluginName', this.pluginName);
            this.config.set('kebabPluginName', this.kebabPluginName);
            this.config.set('namespace', this.namespace);
            this.config.set('xlrFeatures', this.xlrFeatures);
        }
    },

    writing: {
        // generate build files...
        gradle: function () {
            this.fs.copy(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.BUILD}/gradlew`),
                this.destinationPath('gradlew')
            );
            this.fs.copy(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.BUILD}/gradlew.bat`),
                this.destinationPath('gradlew.bat')
            );
            this.fs.copy(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.BUILD}/gradle/`),
                this.destinationPath('gradle/')
            );
            this.fs.copyTpl(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.BUILD}/_settings.gradle`),
                this.destinationPath('settings.gradle'),
                {rootProjectName: this.kebabPluginName}
            );
            this.fs.copyTpl(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.BUILD}/_build.gradle`),
                this.destinationPath('build.gradle'),
                {kebabPluginName: this.kebabPluginName, xlrFeatures: this.xlrFeatures}
            );
        },

        // resources...
        resources: function () {
            mkdirp(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES);

            this.fs.copyTpl(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.RESOURCES}/_synthetic.xml`),
                this.destinationPath(`${CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES}/synthetic.xml`),
                {}
            );

            if (this.xlrFeatures.indexOf('rest') > -1) {
                this.fs.copyTpl(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.RESOURCES}/_xl-rest-endpoints.xml`),
                    this.destinationPath(`${CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES}/xl-rest-endpoints.xml`),
                    {}
                );
            }

            if (this.xlrFeatures.indexOf('tiles') > -1) {
                this.fs.copyTpl(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.RESOURCES}/_xl-ui-plugin.xml`),
                    this.destinationPath(`${CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES}/xl-ui-plugin.xml`)
                );
            }
        },

        // package.json...
        npm: function () {
            if (this.xlrFeatures.indexOf('tiles') > -1) {
                this.fs.copyTpl(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.NPM}/_package.json`),
                    this.destinationPath('package.json'),
                    {
                        kebabPluginName: this.kebabPluginName,
                        pluginName: this.pluginName
                    }
                );
            }
        },

        // Karma test runner...
        karma: function () {
            if (this.xlrFeatures.indexOf('tiles') > -1) {
                this.fs.copy(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.KARMA}/_karma.conf.js`),
                    this.destinationPath('karma.conf.js')
                );
            }
        },

        unittest: function () {
            mkdirp(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT);
            this.logCreate(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT);
            mkdirp(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT_RUNNER);
            this.logCreate(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT_RUNNER);
            this.fs.copy(
                this.templatePath(path.join(CONSTANTS.APP_TEMPLATE_PATHS.UNITTEST, 'runtests.py')),
                this.destinationPath(path.join(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT_RUNNER, 'runtests.py'))
            );
        },

        readme: function () {
            this.fs.copyTpl(
                this.templatePath('_README.md'),
                this.destinationPath('README.md'),
                {
                    pluginName: this.pluginName,
                    xlrFeatures: this.xlrFeatures,
                    jsUnitTestDir: CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT,
                    jythonUnitTestDir: CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT
                }
            );
        },

        gitignore: function () {
            this.fs.copy(
                this.templatePath('_gitignore'),
                this.destinationPath('.gitignore')
            );
        }
    },

    install: function () {
        if (this.xlrFeatures.indexOf('tiles') > -1) {
            this.npmInstall();
        }
    },

    end: function () {
        this._printPropertiesInstructions();

    },

    _printPropertiesInstructions: function () {
    }
});
