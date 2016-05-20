'use strict';

class DashboardPage {
    constructor() {
        Browser.waitFor('.xlr-dashboard');
    }

    static openDashboardOfRelease(releaseId) {
        browser.setLocation(`/releases/${releaseId}/summary`);
        return new DashboardPage();
    }

    getTile(content) {
        return new Tile(content);
    }
}

class Tile {
    constructor(title) {
        this.tileLocator = () => By.cssContainingText('.gridster-item', title);
        this.tile = () => element(this.tileLocator());
        expect(this.tile().isDisplayed()).toBe(true, `No tile displayed with title "${title}"`);
        this.clickButtonByTooltip = (tooltip) => {
            this.tile().element(By.css(`.panel-heading span[tooltip="'${tooltip}'"]`)).click();
            return this;
        }
    }

    expectContent(text) {
        expect(this.tile().element(By.cssContainingText('.panel-body', text)).isDisplayed())
            .toBe(true, `No tile displayed with content "${text}"`);
        return this;
    }

    openDetailsView() {
        this.clickButtonByTooltip('View details');
        return this;
    }

}

global.DashboardPage = DashboardPage;
global.Tile = Tile;
