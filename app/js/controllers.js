'use strict';
function round (value, precision, mode) {
  var m, f, isHalf, sgn; // helper variables
  precision |= 0; // making sure precision is integer
  m = Math.pow(10, precision);
  value *= m;
  sgn = (value > 0) | -(value < 0); // sign of the number
  isHalf = value % 1 === 0.5 * sgn;
  f = Math.floor(value);
  return (isHalf ? value : Math.round(value)) / m;
}

/* Controllers */
function BruttoNettoController ($scope, $http) {
  // vars
  var singleMonthResult, multipleMonthsResult, monthlyTable, modifyInput;

  // load data from ext source
  $http.get('data/amounts.json').success(function(data) {
    $scope.amounts = data[0];
  });

  // init jQuery vars
  singleMonthResult    = $('#singleMonthResult');
  multipleMonthsResult = $('#multipleMonthsResult');
  monthlyTable         = $('#monthlyTable');
  modifyInput          = $('#modifyInput');

  // define variables
  $scope.months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
  $scope.title = "Kal-kula-tory";
  $scope.data  = [];
  $scope.sum = {
    gross: 0,
    pension: 0,
    disability: 0,
    sickness: 0,
    health: 0,
    base: 0,
    advance: 0,
    net: 0
  };

  $scope.monthValues = []; // array that hold each month values initially is empty if user wants to calculate single month
  $scope.singleMonth = true; // count single month or each independently

  // assign boolean to display calculations for each month separately
  $('.singleMonthContainer button').on('click', function() {
    $scope.singleMonth = $(this).data('single');
  });

  // when user chooses to count each month independetly
  $scope.eachMonth = function () {
    var a = $scope.amount || 0;

    if ($scope.singleMonth) {
      monthlyTable.hide(); // hide multipleMonthsResult table
      multipleMonthsResult.hide(); // hide each month table
      $scope.monthValues = []; // clear array with results
      modifyInput.hide(); // hide button for modify input
    } else {
      $scope.monthValues = [a, a, a, a, a, a, a, a, a, a, a, a]; // fill the array with value from amount
      singleMonthResult.hide(); // hide results for single month
      monthlyTable.show(); // show each month table
    }

    console.log($scope.monthValues);
  };

  // update each month as in amount input only when user chooses to count each each month
  $scope.updateValues = function() {
    if (!$scope.singleMonth) {
      for (var i = 0; i < $scope.months.length; i++) {
        $scope.monthValues[i] = $scope.amount;
      }
    }
  }

  // check what to do on submit
  $scope.submit = function() {
    var i, results;

    // return false if no input or NaN
    if ($scope.amount === '' || isNaN($scope.amount)) {
      console.error('wrong input');
      return false;
    }

    // clear any prev calculations
    $scope.data = [];

    // if user did not choose to count each month independently
    if ($scope.singleMonth) {
      // clear the previous results
      $scope.monthValues = [];
      // append amount from input to array
      $scope.monthValues.push($scope.amount);
      // count and show results
      $scope.data.push($scope.count($scope.amount));

      // show table with results
      singleMonthResult
        .css('display', 'none')
        .fadeIn();

    } else {
      // clear previous sums
      $scope.sum = {
        gross: 0,
        pension: 0,
        disability: 0,
        sickness: 0,
        health: 0,
        base: 0,
        advance: 0,
        net: 0
      };

      // loop over each month and sum results
      for (i = 0; i < $scope.monthValues.length; i++) {
        // get results from count
        results = $scope.count($scope.monthValues[i]);

        // sum up all counted months
        $scope.sum.gross      += results.gross;
        $scope.sum.pension    += results.insurance.pension;
        $scope.sum.disability += results.insurance.disability;
        $scope.sum.sickness   += results.insurance.sickness;
        $scope.sum.health     += results.amountForHI;
        $scope.sum.base       += results.baseForIncomeTax;
        $scope.sum.advance    += results.advanceFIT;
        $scope.sum.net        += results.net;

        // add results of count to array
        $scope.data.push(results);
      }

      $scope.sum.pension    = round($scope.sum.pension, 2);
      $scope.sum.disability = round($scope.sum.disability, 2);
      $scope.sum.sickness   = round($scope.sum.sickness, 2);
      $scope.sum.health     = round($scope.sum.health, 2);
      $scope.sum.net        = round($scope.sum.net, 2);

      // hide each month table
      monthlyTable.hide();

      // show link to modify each month
      modifyInput.show();

      // show results
      multipleMonthsResult
        .css({display: 'none'})
        .fadeIn();
    }
  };

  $scope.count = function (gross) {
    var data = {};
    // store each piece of calculation in object
    data.gross            = Number(gross);
    data.insurance        = countInsurance(data);
    data.baseHealth       = getBaseForHealthInsurance(data);
    data.amountForHI      = getAmountForHealthInsurance(data);
    data.amountForHITT    = getAmountForHealthInsuranceToTax(data);
    data.baseForIncomeTax = getBaseForIncomeTax(data);
    data.advanceFITBH     = getAdvanceForIncomeTaxBeforeHealth(data);
    data.advanceFIT       = getAdvanceForIncomeTax(data);
    data.net              = getNet(data);
    // return calculations
    return data;
  }



  // składki na ubezpieczenie społeczne, finansowane przez pracownika
  // w tym składka:
  // pension 9,76%, tj. 146,40 zł
  // disability 1,5%, tj. 22,50 zł
  // sickness 2,45%, tj. 36,75 zł
  function countInsurance(data) {
    var gross, results, reduced;

    gross = data.gross;

    results = {
      pension    : round(gross * $scope.amounts.pension, 2),
      disability : round(gross * $scope.amounts.disability, 2),
      sickness   : round(gross * $scope.amounts.sickness, 2)
    };

    reduced = _(results).reduce(function(memo, num) { return memo + num; });

    results.total = round(reduced, 2);
    return results;
  }

  // podstawa wymiaru składki na ubezpieczenie zdrowotne (gross - insurance.total)
  function getBaseForHealthInsurance(data) {
    return data.gross - data.insurance.total;
  }

  // składka na ubezpieczenie zdrowotne do pobrania z wynagrodzenia (data.baseHealth x 9%)
  function getAmountForHealthInsurance(data) {
    return round((data.baseHealth * $scope.amounts.health), 2);
  }

  // składka na ubezpieczenie zdrowotne do odliczenia od podatku (data.baseHealth x 7,75%)
  function getAmountForHealthInsuranceToTax(data) {
    return round((data.baseHealth * $scope.amounts.tax), 2);
  }

  // podstawa obliczenia zaliczki na podatek dochodowy, po zaokrągleniu do pełnych złotych (gross - $scope.amounts.incomeCost - insurance.total)
  function getBaseForIncomeTax(data) {
    return Math.floor(data.gross - $scope.amounts.incomeCost - data.insurance.total);
  }

  // zaliczka na podatek dochodowy przed odliczeniem składki zdrowotnej [(baseForIncomeTax x 18%) - 46,33 zł]
  function getAdvanceForIncomeTaxBeforeHealth(data) {
    return round(((data.baseForIncomeTax * 0.18) - 46.33), 2);
  }

  // zaliczka na podatek dochodowy do pobrania, po zaokrągleniu do pełnych złotych (advanceFITBH - amountForHITT)
  function getAdvanceForIncomeTax(data) {
    return Math.floor(data.advanceFITBH - data.amountForHITT, 2);
  }

  // kwota do wypłaty (gross - suma ubezpieczen - składka na zdrowotne do pobrania z wynagrodzenia - zaliczka na podatek)
  function getNet(data) {
    return round(data.gross - data.insurance.total - data.amountForHI - data.advanceFIT, 2);
  }

  // składki obciążające pracodawcę od kwoty 1.500 zł:
  // (składka pension 9,76%, tj. 146,40 zł
  // + składka disability 6,5%, tj. 97,50 zł
  // + składka wypadkowa 1,93%, tj. 28,95 zł
  // + składka na FP 2,45%, tj. 36,75 zł
  // + składka na FGŚP 0,10%, tj. 1,50 zł)
  // 311,10 zł

  // razem koszt pracodawcy (poz. a + poz. l) 1.811,10 zł
}
// BruttoNettoController.$inject = [];

function IndexController ($scope) {
  // Index page controller
}

function NettoBruttoController ($scope) {
  // Netto Brutto Controller page controller
}