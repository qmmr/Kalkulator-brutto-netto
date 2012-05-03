'use strict';

/* Controllers */

function Calculator($scope) {
  $scope.title = "Calculator brutto - netto";

  $scope.count = function () {
    alert($scope.amount);
  }
}
// Calculator.$inject = [];