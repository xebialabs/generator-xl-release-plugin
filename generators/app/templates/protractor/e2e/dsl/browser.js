'use strict';

class Browser {
    static open() {
        return browser.get('#/');
    }

    static setSize(width, height) {
        return browser.manage().window().setSize(width, height);
    }

    static wait(conditionFunction, message, timeout) {
        timeout = timeout || 30000;
        return browser.wait(conditionFunction, timeout, message);
    }

    static waitFor(cssSelector, timeout) {
        return Browser.wait(() => element(By.css(cssSelector)).isPresent(),
            `waiting for '${cssSelector}' to be present`, timeout);
    }
}

global.Browser = Browser;
