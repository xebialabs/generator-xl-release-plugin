// Task subgenerator
var path = require('path');
var mkdirp = require('mkdirp');
var generators = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('lodash');
var CONSTANTS = require('../constants');
var util = require('../util');

module.exports = generators.Base.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.testFrameworks = [];
    },

    initializing: {
        loadConfig: function () {
            this.pluginName = this.config.get('pluginName');
            this.testFrameworks = this.config.get('testFrameworks');
        }
    },

    prompting: {
        tileName: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileName',
                message: 'Your tile name',
                store: false
            }, function (answers) {
                this.tileName = answers.tileName;
                done();
            }.bind(this));
        },

        namespace: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileNamespace',
                message: 'Tile namespace',
                store: false
            }, function (answers) {
                this.tileNamespace = answers.tileNamespace;
                this.tilePath = util.namespaceToPath(this.tileNamespace);
                done();
            }.bind(this));
        },

        label: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileLabel',
                message: 'Tile label',
                store: false
            }, function (answers) {
                this.tileLabel = answers.tileLabel;
                done();
            }.bind(this));
        }
    },

    default: {
        saveConfig: function () {
            // do I have anything to save?
        }
    },

    writing: function () {
        var tileFullPath = path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, this.tilePath);
        mkdirp(tileFullPath);
        this.log(util.logCreate(tileFullPath));

        var pascalTileName = _.upperFirst(_.camelCase(this.tileName));
        this.fs.copyTpl(
            this.templatePath('_TileScript.py'),
            this.destinationPath(path.join(tileFullPath), `${pascalTileName}.py`),
            {}
        );

        var tileIncludePath = path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, this.tilePath, pascalTileName);
        mkdirp(tileIncludePath);
        this.log(util.logCreate(tileIncludePath));
        mkdirp(path.join(tileIncludePath, 'js'));
        this.log(util.logCreate(path.join(tileIncludePath, 'js')));
        mkdirp(path.join(tileIncludePath, 'css'));
        this.log(util.logCreate(path.join(tileIncludePath, 'css')));
        mkdirp(path.join(tileIncludePath, 'img'));
        this.log(util.logCreate(path.join(tileIncludePath, 'img')));

        var moduleName = `xlrelease.${this.tileNamespace}.${util.lowerCaseCompact(this.tileName)}`; // xlrelease.jira.jiratile
        var kebabTileName = _.kebabCase(this.tileName); // JiraTask -> jira-task

        this.fs.copyTpl(
            this.templatePath('_tile-app.js'),
            this.destinationPath(path.join(tileIncludePath, 'js', `${kebabTileName}-app.js`)),
            {moduleName: moduleName}
        );

        var controllerName = this.tileName + 'Controller';
        this.fs.copyTpl(
            this.templatePath('_tile-controller.js'),
            this.destinationPath(path.join(tileIncludePath, 'js', `${_.kebabCase(controllerName)}.js`)),
            {moduleName, controllerName}
        );

        if (this.testFrameworks.indexOf('karma') > -1) {
            var testPath = path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, this.tileNamespace, this.tileName);
            mkdirp(testPath);
            this.log(util.logCreate(path.join(testPath)));
            this.fs.copyTpl(
                this.templatePath('_tile-controller.spec.js'),
                this.destinationPath(path.join(testPath, `${_.kebabCase(controllerName)}.spec.js`)),
                {moduleName, controllerName}
            );
        }

        this.fs.copyTpl(
            this.templatePath('_tile.css'),
            this.destinationPath(path.join(tileIncludePath, 'css', `${kebabTileName}.css`)),
            {kebabTileName: kebabTileName}
        );

        this.fs.copyTpl(
            this.templatePath('_tile-summary-view.html'),
            this.destinationPath(path.join(tileIncludePath, `${kebabTileName}-summary-view.html`)),
            {controllerName, kebabTileName}
        );

        this.fs.copyTpl(
            this.templatePath('_tile-details-view.html'),
            this.destinationPath(path.join(tileIncludePath, `${kebabTileName}-details.view.html`)),
            {}
        );

        var config = {
            path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
            file: 'synthetic.xml',
            type: [
                `<type type="${this.tileNamespace}.${pascalTileName}" label="${this.tileLabel}" extends="xlrelease.Tile">`,
                `    <property name="uri" hidden="true" default="include/${this.tilePath}/${pascalTileName}/${kebabTileName}-summary-view.html" />`,
                `    <property name="detailsUri" hidden="true" default="include/${this.tilePath}/${pascalTileName}/${kebabTileName}-details.html" />`,
                `    <property name="title" description="Tile title" default="${this.tileName}"/>`,
                '    <!-- Add tile properties here! -->',
                '</type>'
            ]
        };

        util.appendType(config);
    }
});
