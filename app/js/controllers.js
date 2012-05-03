'use strict';

/* Controllers */

function Calculator($scope, $http) {
  var data = {};

  $http.get('data/amounts.json').success(function(data) {
    $scope.amounts = data[0];
  });

  $scope.title = "Calculator brutto - netto";
  $scope.data  = [];

  $scope.count = function () {
    // clear any prev calculations
    $scope.data = [];

    // return false if no input or NaN
    if ($scope.amount === '' || isNaN($scope.amount)) {
      alert('wrong input');
      return false;
    }
    // store each piece of calculation in object
    data.brutto           = Number($scope.amount);
    data.socialInsurance  = countSocialInsurance();
    data.baseHealth       = getBaseForHealthInsurance();
    data.amountForHI      = getAmountForHealthInsurance();
    data.amountForHITT    = getAmountForHealthInsuranceToTax();
    data.baseForIncomeTax = getBaseForIncomeTax();
    data.advanceFITBH     = getAdvanceForIncomeTaxBeforeHealth();
    data.advanceFIT       = getAdvanceForIncomeTax();
    data.salary           = getSalary();

    // gather needed pieces in array
    $scope.data.push({ nazwa: 'składki na ubezpieczenie społeczne', kwota: data.socialInsurance.total });
    $scope.data.push({ nazwa: 'składka na ubezpieczenie zdrowotne', kwota: data.amountForHI });
    $scope.data.push({ nazwa: 'zaliczka na podatek dochodowy', kwota: data.advanceFIT });
    $scope.data.push({ nazwa: 'wynagrodzenie netto', kwota: data.salary });
    console.log(data);
  }

  function round (value, precision, mode) {
      // Returns the number rounded to specified precision
      //
      // version: 1109.2015
      // discuss at: http://phpjs.org/functions/round
      // +   original by: Philip Peterson
      // +    revised by: Onno Marsman
      // +      input by: Greenseed
      // +    revised by: T.Wild
      // +      input by: meo
      // +      input by: William
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +      input by: Josep Sanz (http://www.ws3.es/)
      // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
      // %        note 1: Great work. Ideas for improvement:
      // %        note 1:  - code more compliant with developer guidelines
      // %        note 1:  - for implementing PHP constant arguments look at
      // %        note 1:  the pathinfo() function, it offers the greatest
      // %        note 1:  flexibility & compatibility possible
      // *     example 1: round(1241757, -3);
      // *     returns 1: 1242000
      // *     example 2: round(3.6);
      // *     returns 2: 4
      // *     example 3: round(2.835, 2);
      // *     returns 3: 2.84
      // *     example 4: round(1.1749999999999, 2);
      // *     returns 4: 1.17
      // *     example 5: round(58551.799999999996, 2);
      // *     returns 5: 58551.8
      var m, f, isHalf, sgn; // helper variables
      precision |= 0; // making sure precision is integer
      m = Math.pow(10, precision);
      value *= m;
      sgn = (value > 0) | -(value < 0); // sign of the number
      isHalf = value % 1 === 0.5 * sgn;
      f = Math.floor(value);

      if (isHalf) {
          switch (mode) {
          case 'PHP_ROUND_HALF_DOWN':
              value = f + (sgn < 0); // rounds .5 toward zero
              break;
          case 'PHP_ROUND_HALF_EVEN':
              value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
              break;
          case 'PHP_ROUND_HALF_ODD':
              value = f + !(f % 2); // rounds .5 towards the next odd integer
              break;
          default:
              value = f + (sgn > 0); // rounds .5 away from zero
          }
      }

      return (isHalf ? value : Math.round(value)) / m;
  }

  // składki na ubezpieczenie społeczne, finansowane przez pracownika
  // w tym składka:
  // emerytalna 9,76%, tj. 146,40 zł
  // rentowa 1,5%, tj. 22,50 zł
  // chorobowa 2,45%, tj. 36,75 zł
  function countSocialInsurance($amount) {
    var
    brutto = data.brutto,
    results = {
      emerytalna: round(brutto * $scope.amounts.emerytalna, 2),
      rentowa   : round(brutto * $scope.amounts.rentowa, 2),
      chorobowa : round(brutto * $scope.amounts.chorobowa, 2)
    },
    reduced = _(results).reduce(function(memo, num) { return memo + num; });

    results.total = round(reduced, 2);

    return results;
  }

  // podstawa wymiaru składki na ubezpieczenie zdrowotne (brutto - socialInsurance.total)
  function getBaseForHealthInsurance() {
    // return Number(data.brutto - data.socialInsurance.total);
    return data.brutto - data.socialInsurance.total;
  }

  // składka na ubezpieczenie zdrowotne do pobrania z wynagrodzenia (data.baseHealth x 9%)
  function getAmountForHealthInsurance() {
    return Number((data.baseHealth * $scope.amounts.zdrowotne).toFixed(2));
  }

  // składka na ubezpieczenie zdrowotne do odliczenia od podatku (data.baseHealth x 7,75%)
  function getAmountForHealthInsuranceToTax() {
    return Number((data.baseHealth * $scope.amounts.podatkowe).toFixed(2));
  }

  // podstawa obliczenia zaliczki na podatek dochodowy, po zaokrągleniu do pełnych złotych (brutto - $scope.amounts.incomeCost - socialInsurance.total)
  function getBaseForIncomeTax() {
    return Number((data.brutto - $scope.amounts.incomeCost - data.socialInsurance.total).toFixed());
  }

  // zaliczka na podatek dochodowy przed odliczeniem składki zdrowotnej [(baseForIncomeTax x 18%) - 46,33 zł]
  function getAdvanceForIncomeTaxBeforeHealth() {
    return ((data.baseForIncomeTax * 0.18) - 46.33);
  }

  // zaliczka na podatek dochodowy do pobrania, po zaokrągleniu do pełnych złotych (advanceFITBH - amountForHITT)
  function getAdvanceForIncomeTax() {
    return Math.floor(data.advanceFITBH - data.amountForHITT, 2);
  }

  // kwota do wypłaty (poz. a - poz. c - poz. e - poz. j)
  function getSalary() {
    return round(data.brutto - data.socialInsurance.total - data.amountForHI - data.advanceFIT, 2);
  }

  // składki obciążające pracodawcę od kwoty 1.500 zł:
  // (składka emerytalna 9,76%, tj. 146,40 zł
  // + składka rentowa 6,5%, tj. 97,50 zł
  // + składka wypadkowa 1,93%, tj. 28,95 zł
  // + składka na FP 2,45%, tj. 36,75 zł
  // + składka na FGŚP 0,10%, tj. 1,50 zł)
  // 311,10 zł

  // razem koszt pracodawcy (poz. a + poz. l) 1.811,10 zł
}
// Calculator.$inject = [];