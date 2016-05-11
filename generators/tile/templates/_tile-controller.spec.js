describe('<%= controllerName %>', function () {
    beforeEach(module('<%= moduleName %>'));

    var $controller, $scope, controller;

    beforeEach(module(($provide) => {
        $provide.factory('xlrelease.dashboard.XlrDefaultTileService', ['$q', ($q) => {
            return {
                executeQuery: (id) => {
                    let deferred = $q.defer();
                    deferred.resolve({});
                    return deferred.promise;
                }
            };
        }]);
    }));

    beforeEach(inject((_$rootScope_, _$controller_) => {
        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        $scope.xlrTile = {
            tile: {id: 12}
        };
        controller = $controller('<%= controllerName %>', {
            $scope: $scope
        });
    }));

    it('dummy test', function () {
        expect(controller).not.toBe(null);
    });
});
