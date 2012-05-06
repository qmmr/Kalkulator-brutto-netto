'use strict';

// Declare app level module which depends on filters, and services
angular.module('calc', ['calc.filters', 'calc.services', 'calc.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {template: 'partials/index.html', controller: IndexController})
      .when('/brutto-netto', {template: 'partials/brutto-netto.html', controller: BruttoNettoController})
      .when('/netto-brutto', {template: 'partials/netto-brutto.html', controller: NettoBruttoController})
      .otherwise({redirectTo: '/'});
  }]);
  /*.filter('reverse', function() {
      return function(input, uppercase) {
        var out = "";
        for (var i = 0; i < input.length; i++) {
          out = input.charAt(i) + out;
        }
        // conditional based on optional argument
        if (uppercase) {
          out = out.toUpperCase();
        }
        return out;
      }
  });*/