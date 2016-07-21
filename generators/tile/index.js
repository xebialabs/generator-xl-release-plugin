// Tile subgenerator
var path = require('path');
var util = require('util');
var mkdirp = require('mkdirp');
var generators = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('lodash');
var CONSTANTS = require('../constants');
var BaseGenerator = require('../base-generator');
var xlrUtil = require('../util');

var XlrGenerator = generators.Base.extend({});
util.inherits(XlrGenerator, BaseGenerator);

module.exports = XlrGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        loadConfig: function () {
            this.pluginName = this.config.get('pluginName');
            this.namespace = this.config.get('namespace');
        }
    },

    prompting: {

        tileNamespace: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileNamespace',
                message: 'Namespace',
                default: this.namespace,
                store: false
            }, function (answers) {
                this.tileNamespace = answers.tileNamespace;
                this.tilePath = xlrUtil.namespaceToPath(this.tileNamespace);
                done();
            }.bind(this));
        },

        tileName: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileName',
                message: 'Tile name',
                store: false
            }, function (answers) {
                this.tileName = answers.tileName;
                done();
            }.bind(this));
        },

        tileLabel: function () {
            var done = this.async();
            this.prompt({
                type: 'input',
                name: 'tileLabel',
                message: 'Label in UI',
                store: false
            }, function (answers) {
                this.tileLabel = answers.tileLabel;
                done();
            }.bind(this));
        },

        useDefaultController: function () {
            var done = this.async();
            this.prompt({
                type: 'confirm',
                name: 'useDefaultController',
                message: 'Use default controller?',
                default: false,
                store: false
            }, function (answers) {
                this.useDefaultController = answers.useDefaultController;
                done();
            }.bind(this));
        },

        createDetailsView: function () {
            var done = this.async();
            this.prompt({
                type: 'confirm',
                name: 'createDetailsView',
                message: 'Add details view?',
                default: true,
                store: false
            }, function (answers) {
                this.createDetailsView = answers.createDetailsView;
                done();
            }.bind(this));
        }
    },

    writing: function () {
        var tileFullPath = path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, this.tilePath);
        mkdirp(tileFullPath);
        this.logCreate(tileFullPath);

        var pascalTileName = _.upperFirst(_.camelCase(this.tileName));
        this.fs.copyTpl(
            this.templatePath('_TileScript.py'),
            this.destinationPath(path.join(tileFullPath), `${pascalTileName}.py`),
            {}
        );

        var tileIncludePath = path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, this.tilePath, pascalTileName);
        mkdirp(tileIncludePath);
        this.logCreate(tileIncludePath);
        if (!this.useDefaultController) {
            mkdirp(path.join(tileIncludePath, 'js'));
            this.logCreate(path.join(tileIncludePath, 'js'));
        }
        mkdirp(path.join(tileIncludePath, 'css'));
        this.logCreate(path.join(tileIncludePath, 'css'));
        mkdirp(path.join(tileIncludePath, 'img'));
        this.logCreate(path.join(tileIncludePath, 'img'));

        var kebabTileName = _.kebabCase(this.tileName); // JiraTile -> jira-tile
        var moduleName = `xlrelease.${this.tileNamespace}.${xlrUtil.lowerCaseCompact(this.tileName)}`; // xlrelease.jira.jiratile
        var controllerName = this.useDefaultController ? CONSTANTS.DEFAULT_TILE_CONTROLLER_NAME : this.tileName + 'Controller';

        if (!this.useDefaultController) {
            this.fs.copyTpl(
                this.templatePath('_tile.js'),
                this.destinationPath(path.join(tileIncludePath, 'js', `${kebabTileName}.js`)),
                {
                    moduleName: moduleName,
                    controllerName: controllerName
                }
            );

            var testPath = path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, this.tileNamespace, this.tileName);
            mkdirp(testPath);
            this.logCreate(testPath);
            this.fs.copyTpl(
                this.templatePath('_tile-controller.spec.js'),
                this.destinationPath(path.join(testPath, `${_.kebabCase(controllerName)}.spec.js`)),
                {
                    moduleName: moduleName,
                    controllerName: controllerName
                }
            );
        }

        var e2ePath = path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario');
        mkdirp(e2ePath);
        this.logCreate(e2ePath);
        this.fs.copyTpl(
            this.templatePath('_tile-scenario.js'),
            this.destinationPath(path.join(e2ePath, `${kebabTileName}-scenario.js`)),
            {
                tileLabel: this.tileLabel,
                tileNamespace: this.tileNamespace,
                pascalTileName
            }
        );

        this.fs.copyTpl(
            this.templatePath('_tile.css'),
            this.destinationPath(path.join(tileIncludePath, 'css', `${kebabTileName}.css`)),
            {
                kebabTileName,
                createDetailsView: this.createDetailsView
            }
        );

        this.fs.copyTpl(
            this.templatePath('_tile-view.html'),
            this.destinationPath(path.join(tileIncludePath, `${kebabTileName}-summary-view.html`)),
            {
                useDefaultController: this.useDefaultController,
                controllerName,
                kebabTileName,
                viewMode: 'summary'
            }
        );

        if (this.createDetailsView) {
            this.fs.copyTpl(
                this.templatePath('_tile-view.html'),
                this.destinationPath(path.join(tileIncludePath, `${kebabTileName}-details-view.html`)),
                {
                    useDefaultController: this.useDefaultController,
                    controllerName,
                    kebabTileName,
                    viewMode: 'details'
                }
            );
        }

        // update synthetic.xml
        var type = [
            '',
            `<type type="${this.tileNamespace}.${pascalTileName}" label="${this.tileLabel}" extends="xlrelease.Tile">`,
            `    <property name="uri" hidden="true" default="include/${this.tilePath}/${pascalTileName}/${kebabTileName}-summary-view.html" />`,
            `    <property name="title" default="${this.tileLabel}"/>`,
            '',
            '    <!-- Customizable tile properties -->',
            '    <property category="input" name="greetingName" required="true" description="The name to say hello to." />',
            '</type>'
        ];

        if (this.createDetailsView) {
            type.splice(2, 0, [`    <property name="detailsUri" hidden="true" default="include/${this.tilePath}/${pascalTileName}/${kebabTileName}-details-view.html" />`]);
        }

        var config = {
            path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
            file: 'synthetic.xml',
            type: type
        };
        xlrUtil.appendType(config);

        if (!this.useDefaultController) {
            if (this.fs.exists(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'))) {
                var xlUiAppendConfig = {
                    path: CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES,
                    file: 'xl-ui-plugin.xml',
                    needle: '</plugin>',
                    type: [`<library name="${moduleName}" />`]
                };
                xlrUtil.appendType(xlUiAppendConfig);
            } else {
                this.fs.copyTpl(
                    this.templatePath('_xl-ui-plugin.xml'),
                    this.destinationPath(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml')),
                    {
                        moduleName: moduleName
                    }
                );
            }
        }
    }
});
