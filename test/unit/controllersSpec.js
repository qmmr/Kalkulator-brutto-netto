'use strict';

/* jasmine specs for controllers go here */

describe('BruttoNettoController', function(){
  var ctrl, scope, $http;

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $http = _$httpBackend_;
    $http.expectGET('data/amounts.json').
        respond([{"emerytalna": 0.0976, "rentowa"   : 0.015, "chorobowa" : 0.0245, "zdrowotne" : 0.09, "podatkowe" : 0.0775, "incomeCost": 111.25 }]);
    scope = $rootScope.$new();
    ctrl = $controller(BruttoNettoController, {$scope: scope});
  }));

  it('should get data from json', function() {
    expect(scope.amounts).toBeUndefined();
    $http.flush();
    expect(scope.amounts).toEqual({"emerytalna": 0.0976, "rentowa"   : 0.015, "chorobowa" : 0.0245, "zdrowotne" : 0.09, "podatkowe" : 0.0775, "incomeCost": 111.25 });
  });

  it('should not show results table', function() {
    expect(scope.showResults).toBe('false');
  });

  it('should have monthValues set as empty array', function() {
    expect(scope.monthValues).toEqual = [];
  });

  it('should have monthly set to true unless user wants to count each month independently', function() {
    expect(scope.monthly).toBe('true');
  });

  // input
  // it('should initialize to model', function() {
  //  expect(binding('amount')).toEqual('');
  //  expect(binding('bruttoNettoForm.amount.$valid')).toEqual('false');
  // });

  // it('should be invalid if empty', function() {
  //  input('amount').enter('');
  //  expect(binding('amount')).toEqual('');
  //  expect(binding('bruttoNettoForm.amount.$valid')).toEqual('false');
  // });

});