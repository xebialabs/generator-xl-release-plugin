'use strict';

let browserName = process.env.KARMA_BROWSER;
if (!browserName) {
    browserName = 'firefox';
}

exports.config = {
    capabilities: {
        browserName: browserName.toLowerCase()
    },
    baseUrl: 'http://localhost:5516',
    directConnect: true,
    specs: [
        './e2e/scenario/**/*.js'
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60 * 1000
    },
    framework: 'jasmine2',
    onPrepare: function () {
        global.requestPromise = require('request-promise');
        global._ = require('lodash');

        let SpecReporter = require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));

        require('./e2e/dsl/fixtures-ci-builder.js');

        let dslFiles = require("glob").sync("./e2e/dsl/**/*.js", {cwd: __dirname});
        _.each(dslFiles, require);

        Browser.open();
        Browser.setSize(1024, 768);
        browser.manage().timeouts().setScriptTimeout(60 * 1000);
    }
};
