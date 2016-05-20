'use strict';

class Flow {
    static execute(command) {
        let flow = protractor.promise.controlFlow();
        flow.execute(function () {
            let d = protractor.promise.defer();
            command(d.fulfill, d.reject);
            return d.promise;
        });
    }
}

global.Flow = Flow;