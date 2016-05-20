/*global describe, beforeAll, beforeEach, it*/
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');
var path = require('path');
var fse = require('fs-extra');
const CONSTANTS = require('../generators/constants');

const EXPECTED_FILES = {
    GRADLE: ['gradlew.bat', 'gradlew', 'build.gradle', 'settings.gradle', 'gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.properties'],
    NPM: ['package.json']
};

describe('XL Release plugin generator', function () {
    describe('basic configuration', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    pluginName: 'xlr-test-plugin',
                    namespace: 'test',
                    xlrFeatures: []
                })
                .on('end', done);
        });

        it('should create default files', function () {
            assert.file(EXPECTED_FILES.GRADLE);
            assert.noFile(EXPECTED_FILES.NPM);
            assert.file(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'synthetic.xml'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-rest-endpoints.xml'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS, 'karma.conf.js'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS, 'protractor.conf.js'));

            assert.noFileContent('build.gradle', /[\s\S]*task testJavaScriptUnit[\s\S]*/);
            assert.noFileContent('build.gradle', /[\s\S]*task testEnd2End[\s\S]*/);
        });
    });

    describe('full configuration', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    pluginName: 'XL Release Test Plugin',
                    kebabPluginName: 'xlr-test-plugin',
                    namespace: 'test',
                    xlrFeatures: ['tiles', 'rest']
                })
                .on('end', done);
        });

        it('should create extension XMLs and UI test configuration', function () {
            assert.file([
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'),
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-rest-endpoints.xml'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS, 'karma.conf.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS, 'protractor.conf.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'dsl', 'fixtures.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'startup-scenario.js')
            ]);
            assert.fileContent('build.gradle', /[\s\S]*task testJavaScriptUnit[\s\S]*/);
            assert.fileContent('build.gradle', /[\s\S]*task testEnd2End[\s\S]*/);
            assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'startup-scenario.js'),
                /[\s\S]*describe\('XL Release Test Plugin'[\s\S]*/);
        });
    });

});

describe('XL Release plugin generator - Task', function () {

    beforeEach(function (done) {
        helpers.run(path.join(__dirname, '../generators/task'))
            .inTmpDir(function (dir) {
                fse.copySync(path.join(__dirname, '../test/template'), dir);
            })
            .withPrompts({
                taskName: 'HelloTask',
                taskNamespace: 'hello'
            })
            .on('end', done);
    });

    it('generates task script and updates synthetic', function () {
        assert.file([
            path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'hello', 'HelloTask.py'),
            path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'hello', 'HelloTaskUtils.py'),
            path.join(CONSTANTS.PLUGIN_PATHS.TEST_JYTHON_UNIT, 'test_hello', 'test_HelloTaskUtils.py')
        ]);
        assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'synthetic.xml'),
            /[\s\S]*<type type="hello\.HelloTask" extends="xlrelease\.PythonScript">[\s\S]+<\/type>[\s\S]*/);
    });
});


describe('XL Release plugin generator - Tile', function () {

    describe('use default controller and details view', function() {
        beforeEach(function(done) {
            helpers.run(path.join(__dirname, '../generators/tile'))
            .inTmpDir(function (dir) {
                fse.copySync(path.join(__dirname, '../test/template'), dir);
            })
            .withPrompts({
                tileName: 'WeatherTile',
                tileNamespace: 'weather',
                tileLabel: 'Weather tile',
                useDefaultController: true,
                createDetailsView: true
            })
            .on('end', done);
        });

        it('generates summary view, details view, styles and e2e tests', function() {
            assert.file([
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'weather', 'WeatherTile.py'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-summary-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-details-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'css', 'weather-tile.css'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'weather-tile-scenario.js')
            ]);
            assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'weather-tile-scenario.js'),
                /[\s\S]*describe\('Weather tile'[\s\S]*id: 'ReleaseWithWeatherTile'[\s\S]*type: 'weather.WeatherTile'/);
            assert.noFile([
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, 'weather', 'WeatherTile', 'weather-tile-controller.spec.js')
            ]);
        });
    });

    describe('use default controller and no details view', function() {
        beforeEach(function(done) {
            helpers.run(path.join(__dirname, '../generators/tile'))
            .inTmpDir(function (dir) {
                fse.copySync(path.join(__dirname, '../test/template'), dir);
            })
            .withPrompts({
                tileName: 'WeatherTile',
                tileNamespace: 'weather',
                tileLabel: 'Weather tile',
                useDefaultController: true,
                createDetailsView: false
            })
            .on('end', done);
        });

        it('generates summary view, styles and e2e tests', function() {
            assert.file([
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'weather', 'WeatherTile.py'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-summary-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'css', 'weather-tile.css'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'weather-tile-scenario.js')
            ]);
            assert.noFile([
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-details-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, 'weather', 'WeatherTile', 'weather-tile-controller.spec.js')
            ]);
        });
    });

    describe('use custom controller and details view', function() {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/tile'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/template'), dir);
                })
                .withPrompts({
                    tileName: 'WeatherTile',
                    tileNamespace: 'weather',
                    tileLabel: 'Weather tile',
                    useDefaultController: false,
                    createDetailsView: true
                })
                .on('end', done);
        });

        it('generates angular module, styles, summary view, details view, front end tests and updates xl-ui-plugins', function () {
            assert.file([
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'weather', 'WeatherTile.py'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-summary-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-details-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'css', 'weather-tile.css'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, 'weather', 'WeatherTile', 'weather-tile-controller.spec.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'weather-tile-scenario.js')
            ]);
            assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'),
                /[\s\S]*<library name="xlrelease.weather.weathertile"[\s\S]*\/>/);
        });
    });

    describe('use custom controller and no details view', function() {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/tile'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/template'), dir);
                })
                .withPrompts({
                    tileName: 'WeatherTile',
                    tileNamespace: 'weather',
                    tileLabel: 'Weather tile',
                    useDefaultController: false,
                    createDetailsView: false
                })
                .on('end', done);
        });

        it('generates angular module, styles, front end tests and no details view', function() {
            assert.file([
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'weather', 'WeatherTile.py'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-summary-view.html'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'css', 'weather-tile.css'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, 'weather', 'WeatherTile', 'weather-tile-controller.spec.js'),
                path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_E2E, 'scenario', 'weather-tile-scenario.js')
            ]);
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-details-view.html'));
        });
    });

    describe("when there's no xl-ui-plugin.xml", function () {

        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/tile'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/template-no-ui-xml'), dir);
                })
                .withPrompts({
                    tileName: 'WeatherTile',
                    tileNamespace: 'weather',
                    tileLabel: 'Weather tile',
                    useDefaultController: false,
                    createDetailsView: false
                })
                .on('end', done);
        });

        it('generates it and with the angular module', function () {
            assert.file(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'));
            assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'),
                /[\s\S]*<library name="xlrelease.weather.weathertile"[\s\S]*\/>/);
        });
    });

});