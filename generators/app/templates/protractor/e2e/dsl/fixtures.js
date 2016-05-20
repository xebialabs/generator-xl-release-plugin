'use strict';

let Fixtures = (() => {
    let releaseIds = [];

    function sendRequest(type, url, data) {
        return Flow.execute(function (fulfill, reject) {
            return Server.doRequest(type, url, data).then(fulfill, function (error) {
                return reject(error);
            });
        });
    }

    function release(release) {
        releaseIds.push(release.id);
        return sendRequest('POST', 'fixtures', getReleaseEntities(release));
    }

    function deleteRelease(releaseId) {
        return sendRequest('DELETE', "fixtures/" + releaseId);
    }

    function clean() {
        releaseIds.reverse().forEach((id) => deleteRelease(id));
        releaseIds = [];
    }

    return {
        sendRequest: sendRequest,
        release: release,
        clean: clean
    }
})();

global.fixtures = () => Fixtures;
