describe('<%= tileLabel %>', () => {

    beforeAll(() => {
        fixtures().release({
            id: 'ReleaseWith<%= pascalTileName %>',
            status: 'planned',
            summary: {
                tiles: [{
                    type: '<%= tileNamespace %>.<%= pascalTileName %>',
                    title: '<%= tileLabel %>',
                    greetingName: 'sample tile'
                }]
            }
        });

        LoginPage.login('admin', 'admin');
    });

    afterAll(() => {
        LoginPage.logout();
        fixtures().clean();
    });

    it("should display <%= tileLabel %> with greetings in capital case", () => {
        DashboardPage.openDashboardOfRelease('ReleaseWith<%= pascalTileName %>')
            .getTile('<%= tileLabel %>')
            .expectContent('Sample tile');
    });

});
