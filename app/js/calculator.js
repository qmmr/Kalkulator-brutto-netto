// Generated by CoffeeScript 1.3.3
(function() {
  var Calculator, GrossNet,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Calculator = (function() {

    function Calculator() {
      this.name = "Calculator prototype";
    }

    Calculator.prototype.test = function(msg) {
      return "This is " + this.name + " and here is the " + msg;
    };

    Calculator.prototype.toPrecision = function(num, precision) {
      var prec;
      prec = precision || 2;
      return num.toFixed(prec);
    };

    Calculator.prototype.round = function(value, precision) {
      var f, isHalf, m, sgn;
      precision |= 0;
      m = Math.pow(10, precision);
      value *= m;
      sgn = (value > 0) | -(value < 0);
      isHalf = value % 1 === 0.5 * sgn;
      f = Math.floor(value);
      return (isHalf ? value : Math.round(value)) / m;
    };

    return Calculator;

  })();

  GrossNet = (function(_super) {

    __extends(GrossNet, _super);

    function GrossNet(gross, options) {
      var baseTaxFactor, basicCostOfRevenues, disabilityFactor, healthFactor, incomeCost, pensionFactor, sicknessFactor, taxFactor, taxReductorConstant;
      this.gross = gross;
      this.options = options != null ? options : {};
      /*
            Przykład obliczenia wynagrodzenia netto i jego obciążeń, przy założeniu, że:
            - pracownik otrzymuje wynagrodzenie ze stosunku pracy w wysokości wynagrodzenia minimalnego, tj. 1.500 zł,
            - pracownikowi przysługują podstawowe koszty uzyskania przychodów (111,25 zł), [basic cost of revenues]
            - pracodawca jest upoważniony do pomniejszania zaliczki na podatek dochodowy [advance on income tax] o 1/12 kwoty zmniejszającej podatek (46,33 zł),
            - właściwa dla pracodawcy stopa procentowa składki wypadkowej wynosi 1,93%.
      */

      this.name = "Calculator GrossNet";
      disabilityFactor = this.options.disabilityFactor || 0.015;
      healthFactor = this.options.healthFactor || 0.09;
      incomeCost = this.options.incomeCost || 111.25;
      pensionFactor = this.options.pensionFactor || 0.0976;
      sicknessFactor = this.options.sicknessFactor || 0.0245;
      taxFactor = this.options.taxFactor || 0.0775;
      baseTaxFactor = this.options.baseTaxFactor || 0.18;
      taxReductorConstant = this.options.taxReductorConstant || 46.33;
      basicCostOfRevenues = this.options.basicCostOfRevenues || 111.25;
      this.getPensionFactor = function() {
        return pensionFactor;
      };
      this.getDisabilityFactor = function() {
        return disabilityFactor;
      };
      this.getSicknessFactor = function() {
        return sicknessFactor;
      };
      this.getHealthFactor = function() {
        return healthFactor;
      };
      this.getTaxFactor = function() {
        return taxFactor;
      };
      this.getBaseTaxFactor = function() {
        return baseTaxFactor;
      };
      this.getTaxReductorConstant = function() {
        return taxReductorConstant;
      };
      this.getIncomeCost = function() {
        return incomeCost;
      };
    }

    GrossNet.prototype.test = function() {
      return "" + this.name + " => counting net salary from gross amount of " + this.gross + " pln";
    };

    GrossNet.prototype.getPensionInsurance = function(asString) {
      var result;
      result = this.round(this.gross * this.getPensionFactor(), 2);
      if (asString) {
        return this.toPrecision(result);
      } else {
        return result;
      }
    };

    GrossNet.prototype.getDisabilityInsurance = function(asString) {
      var result;
      result = this.round(this.gross * this.getDisabilityFactor(), 2);
      if (asString) {
        return this.toPrecision(result);
      } else {
        return result;
      }
    };

    GrossNet.prototype.getSicknessInsurance = function(asString) {
      var result;
      result = this.round(this.gross * this.getSicknessFactor(), 2);
      if (asString) {
        return this.toPrecision(result);
      } else {
        return result;
      }
    };

    GrossNet.prototype.getSumOfInsurances = function(asString) {
      var result;
      result = this.getPensionInsurance() + this.getDisabilityInsurance() + this.getSicknessInsurance();
      if (asString) {
        return this.toPrecision(result);
      } else {
        return result;
      }
    };

    GrossNet.prototype.getBaseForHealthInsurance = function() {
      return this.gross - this.getSumOfInsurances();
    };

    GrossNet.prototype.getAmountForHealthInsurance = function() {
      return this.round(this.getBaseForHealthInsurance() * this.getHealthFactor(), 2);
    };

    GrossNet.prototype.getAmountForHealthInsuranceToTax = function() {
      return this.round(this.getBaseForHealthInsurance() * this.getTaxFactor(), 2);
    };

    GrossNet.prototype.getBaseForIncomeTax = function() {
      return Math.floor(this.gross - this.getIncomeCost() - this.getSumOfInsurances());
    };

    GrossNet.prototype.getAdvanceForIncomeTaxBeforeHealth = function() {
      return this.round(this.getBaseForIncomeTax() * this.getBaseTaxFactor() - this.getTaxReductorConstant(), 2);
    };

    GrossNet.prototype.getAdvanceForIncomeTax = function() {
      return Math.floor(this.getAdvanceForIncomeTaxBeforeHealth() - this.getAmountForHealthInsuranceToTax(), 2);
    };

    GrossNet.prototype.getNet = function() {
      return this.round(this.gross - this.getSumOfInsurances() - this.getAmountForHealthInsurance() - this.getAdvanceForIncomeTax(), 2);
    };

    /*
        składki obciążające pracodawcę od kwoty 1.500 zł:
        składka pension 9,76%, tj. 146,40 zł
        + składka disability 6,5%, tj. 97,50 zł
        + składka wypadkowa 1,93%, tj. 28,95 zł
        + składka na FP 2,45%, tj. 36,75 zł
        + składka na FGŚP 0,10%, tj. 1,50 zł)
        311,10 zł
    
        razem koszt pracodawcy (poz. a + poz. l) 1.811,10 zł
    */


    GrossNet.prototype.getEmployerCosts = function() {
      return this.gross * 0.0976 + this.gross * 0.065 + this.gross * 0.0193 + this.gross * 0.0245 + this.gross * 0.001;
    };

    GrossNet.prototype.getTotalEmployerCosts = function() {
      return this.getEmployerCosts() + this.gross;
    };

    return GrossNet;

  })(Calculator);

}).call(this);
