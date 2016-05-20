'use strict';

class Server {

    static doRequest(type, url, data) {
        let options = {
            method: type,
            body: data,
            uri: `${browser.baseUrl}/${url}`,
            json: true,
            auth: {username: 'admin', password: 'admin', sendImmediately: true},
            resolveWithFullResponse: true
        };
        return requestPromise(options);
    }

}

global.Server = Server;