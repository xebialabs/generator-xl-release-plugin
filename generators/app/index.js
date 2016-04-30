var generators = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var chalk = require('chalk');
var CONSTANTS = require('../constants');

module.exports = generators.Base.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.extXmls = {};
        this.testFrameworks = [];
    },

    initializing: {
        // read user input from previous session?
        readConfig: function () {
            this.pluginName = this.config.set('pluginName');
            this.kebabPluginName = this.config.set('kebabPluginName');
            this.xlrVersion = this.config.set('xlrVersion');
            this.extXmls = this.config.set('extXmls');
            this.testFrameworks = this.config.set('testFrameworks');
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

        xlrVersion: function () {
            var done = this.async(); // this is not the preferred way of Inquirer but is of Yeoman?
            this.prompt({
                type: 'input',
                name: 'xlrVersion',
                message: 'XL Release Version',
                store: true
            }, function (answers) {
                this.xlrVersion = answers.xlrVersion;
                done();
            }.bind(this));
        },

        extXmls: function () {
            var done = this.async();
            this.prompt({
                type: 'checkbox',
                name: 'extXmls',
                message: 'Generate additional extensions XMLs?',
                choices: CONSTANTS.EXT_XMLS,
                store: true
            }, function (answers) {
                this.extXmls = answers.extXmls;
                done();
            }.bind(this));
        },

        testFrameworks: function () {
            var done = this.async();
            this.prompt({
                type: 'checkbox',
                name: 'testFrameworks',
                message: 'Which test frameworks to use?',
                choices: CONSTANTS.TEST_FRAMEWORKS,
                store: true
            }, function (answers) {
                this.testFrameworks = answers.testFrameworks;
                done();
            }.bind(this));
        }
    },

    default: {
        // save user input for future?
        saveConfig: function () {
            this.config.set('pluginName', this.pluginName);
            this.config.set('kebabPluginName', this.kebabPluginName);
            this.config.set('xlrVersion', this.xlrVersion);
            this.config.set('extXmls', this.extXmls);
            this.config.set('testFrameworks', this.testFrameworks);
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
                {kebabPluginName: this.kebabPluginName}
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

            if (this.extXmls.indexOf('xl-rest-endpoints') > -1) {
                this.fs.copyTpl(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.RESOURCES}/_xl-rest-endpoints.xml`),
                    this.destinationPath(`${CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES}/xl-rest-endpoints.xml`),
                    {}
                );
            }

            if (this.extXmls.indexOf('xl-ui-plugin') > -1) {
                this.fs.copyTpl(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.RESOURCES}/_xl-ui-plugin.xml`),
                    this.destinationPath(`${CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES}/xl-ui-plugin.xml`),
                    {kebabPluginName: this.kebabPluginName}
                );
            }
        },

        // package.json...
        npm: function () {
            this.fs.copyTpl(
                this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.NPM}/_package.json`),
                this.destinationPath('package.json'),
                {
                    pluginName: this.pluginName,
                    kebabPluginName: this.kebabPluginName,
                    testFrameworks: this.testFrameworks
                }
            );
        },

        // Karma test runner...
        karma: function () {
            if (this.testFrameworks.indexOf('karma') > -1) {
                this.fs.copy(
                    this.templatePath(`${CONSTANTS.APP_TEMPLATE_PATHS.KARMA}/_karma.conf.js`),
                    this.destinationPath('karma.conf.js')
                );
            }
        }
    },

    install: function () {
        this.npmInstall();
    },

    end: function () {
        this._printPropertiesInstructions();

    },

    _printPropertiesInstructions: function () {
        // TODO
    }
});
