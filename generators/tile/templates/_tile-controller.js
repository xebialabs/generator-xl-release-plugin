(function () {
  'use strict';

  function <%= controllerName %>() {
    var vm = this;
  }

  <%= controllerName %>.$inject = [];

  angular.module('<%= moduleName %>')
    .controller('<%= controllerName %>', <%= controllerName %>);
})();
