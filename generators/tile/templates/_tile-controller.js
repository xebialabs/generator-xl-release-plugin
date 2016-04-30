(function () {
    'use strict';

    function <%= controllerName %>() {
        var vm = this;
        vm.title = '<%= controllerName %>';
    }

    <%= controllerName %>.$inject = [];

    angular.module('<%= moduleName %>')
        .controller('<%= controllerName %>', <%= controllerName %>);
})();
