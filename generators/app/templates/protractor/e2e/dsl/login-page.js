'use strict';

class LoginPage {

    static login(username, password) {
        element(By.model('loginInfo.login')).clear();
        element(By.model('loginInfo.login')).sendKeys(username);
        element(By.model('loginInfo.password')).sendKeys(password);
        element(By.css('#login .login-button button')).click();
        browser.waitForAngular();
    }

    static logout() {
        browser.setLocation('/login/');
        browser.waitForAngular();
    }

}

global.LoginPage = LoginPage;
