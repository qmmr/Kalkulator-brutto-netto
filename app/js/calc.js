'use strict';

// Declare app level module which depends on filters, and services
angular.module('calc', ['calc.filters', 'calc.services', 'calc.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {template: 'partials/calculator.html', controller: Calculator})
      .when('/brutto-netto', {template: 'partials/brutto-netto.html', controller: Calculator})
      .when('/netto-brutto', {template: 'partials/netto-brutto.html', controller: Calculator})
      .otherwise({redirectTo: '/'});
  }]);