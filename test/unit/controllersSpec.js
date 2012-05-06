'use strict';

/* jasmine specs for controllers go here */

describe('BruttoNettoController', function(){
  var ctrl, scope, $http;

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    // ctrl = new BruttoNettoController();
    $http = _$httpBackend_;
    $http.expectGET('data/amounts.json').
        respond([{"emerytalna": 0.0976, "rentowa"   : 0.015, "chorobowa" : 0.0245, "zdrowotne" : 0.09, "podatkowe" : 0.0775, "incomeCost": 111.25 }]);
    scope = $rootScope.$new();
    ctrl = $controller(BruttoNettoController, {$scope: scope});
  }));

  it('should get data from json', function() {
    expect(scope.amounts).toBeUndefined();
    $http.flush();
    expect(scope.amounts).toEqual( [{"emerytalna": 0.0976, "rentowa"   : 0.015, "chorobowa" : 0.0245, "zdrowotne" : 0.09, "podatkowe" : 0.0775, "incomeCost": 111.25 }]);
  });


  // var scope, ctrl, $httpBackend;

  // beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
  //   $httpBackend = _$httpBackend_;
  //   $httpBackend.expectGET('data/countries.json').
  //       respond([{ "capital" : "Kabul", "city_population" : 1780000, "code" : "AFG", "continent" : "Asia", "country" : "Afghanistan", "country_population" : 22720000 } ]);

  //   scope = $rootScope.$new();
  //   ctrl = $controller(CountryListCtrl, {$scope: scope});
  // }));


  // it('should set the default value of orderProp model', function() {
  //   expect(scope.orderProp).toBe('country');
  // });

  // it('should have title of "World countries and capitals app"', function () {
  //   expect(scope.title).toBe('World countries and capitals app');
  // });

  // it('should return number of countries from getCountriesLength() equal to 231', function () {
  //   expect(scope.getCountriesLength).toEqual = 231;
  // });
});