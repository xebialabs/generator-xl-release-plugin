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
                    extXmls: [],
                    testFrameworks: []
                })
                .on('end', done);
        });

        it('should create default files', function () {
            assert.file(EXPECTED_FILES.GRADLE);
            assert.file(EXPECTED_FILES.NPM);
            assert.file(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'synthetic.xml'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'));
            assert.noFile(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-rest-endpoints.xml'));
            assert.noFile('karma.conf.js');
        });
    });

    describe('extension XMLs', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    pluginName: 'xlr-test-plugin',
                    namespace: 'test',
                    extXmls: ['xl-ui-plugin', 'xl-rest-endpoints'],
                    testFrameworks: []
                })
                .on('end', done);
        });

        it('should create extension XMLs', function () {
            assert.file([path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'),
                path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-rest-endpoints.xml')]);
        });
    });

    describe('karma configuration', function () {
        beforeEach(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    pluginName: 'xlr-test-plugin',
                    namespace: 'test',
                    extXmls: [],
                    testFrameworks: ['karma']
                })
                .on('end', done);
        });

        it('should create Karma/Jasmin conf file', function () {
            assert.file('karma.conf.js');
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
                taskNamespace: 'hello',
                virtual: false
            })
            .on('end', done);
    });

    it('generates task script and updates synthetic', function () {
        assert.file(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'hello', 'HelloTask.py'));
        assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'synthetic.xml'),
            /[\s\S]*<type type="hello\.HelloTask" extends="xlrelease\.PythonScript">[\s]+<!-- Add task properties here -->[\s]+<\/type>[\s\S]*/);
    });
});


describe('XL Release plugin generator - Tile', function () {

    beforeEach(function (done) {
        helpers.run(path.join(__dirname, '../generators/tile'))
            .inTmpDir(function (dir) {
                fse.copySync(path.join(__dirname, '../test/template'), dir);
            })
            .withPrompts({
                tileName: 'WeatherTile',
                tileNamespace: 'weather',
                tileLabel: 'Weather label'
            })
            .on('end', done);
    });

    it('generates tile files and updates synthetic and xl-ui-plugins', function () {
        assert.file([
            path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'weather', 'WeatherTile.py'),
            path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-summary-view.html'),
            path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'weather-tile-details-view.html'),
            path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile-app.js'),
            path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'js', 'weather-tile-controller.js'),
            path.join(CONSTANTS.PLUGIN_PATHS.WEB_INCLUDE, 'weather', 'WeatherTile', 'css', 'weather-tile.css'),
            path.join(CONSTANTS.PLUGIN_PATHS.TEST_JS_UNIT, 'weather', 'WeatherTile', 'weather-tile-controller.spec.js')
        ]);
        assert.fileContent(path.join(CONSTANTS.PLUGIN_PATHS.MAIN_RESOURCES, 'xl-ui-plugin.xml'),
            /[\s\S]*<library name="xlrelease.weather.weathertile"[\s\S]*/);
    });
});