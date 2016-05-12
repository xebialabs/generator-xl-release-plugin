(function () {
    'use strict';

    function <%= controllerName %>($scope, XlrDefaultTileService) {
        var tile;
        if ($scope.xlrTile) {
            tile = $scope.xlrTile.tile; // summary view
        } else {
            tile = $scope.xlrTileDetailsCtrl.tile; // details view
        }

        var vm = this;
        load();

        function load() {
            vm.loading = true;
            // Query to get the data from the weather service
            XlrDefaultTileService.executeQuery(tile.id).then(function (response) {
                vm.data = response.data.data;
                vm.loaded = true;
            }).finally(function () {
                vm.loading = false;
            });
        }


    }

    <%= controllerName %>.$inject = ['$scope', 'xlrelease.dashboard.XlrDefaultTileService'];
    
    angular.module('<%= moduleName %>', [])
        .controller('<%= controllerName %>', <%= controllerName %> );

})();