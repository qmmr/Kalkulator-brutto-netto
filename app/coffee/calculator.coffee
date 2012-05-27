class Calculator
  constructor: ->
    @name = "Calculator prototype"

  test: ( msg ) ->
    "This is #{@name} and here is the #{msg}"

  toPrecision: ( num, precision ) ->
    prec = precision || 2
    num.toFixed prec

  round: ( value, precision ) ->
    precision |= 0
    m = Math.pow 10, precision
    value *= m
    sgn = (value > 0) | -(value < 0)
    isHalf = value % 1 is 0.5 * sgn
    f = Math.floor value
    (if isHalf then value else Math.round value) / m

class GrossNet extends Calculator
  constructor: ( @gross, @options = {} ) ->
    ###
      Przykład obliczenia wynagrodzenia netto i jego obciążeń, przy założeniu, że:
      - pracownik otrzymuje wynagrodzenie ze stosunku pracy w wysokości wynagrodzenia minimalnego, tj. 1.500 zł,
      - pracownikowi przysługują podstawowe koszty uzyskania przychodów (111,25 zł), [basic cost of revenues]
      - pracodawca jest upoważniony do pomniejszania zaliczki na podatek dochodowy [advance on income tax] o 1/12 kwoty zmniejszającej podatek (46,33 zł),
      - właściwa dla pracodawcy stopa procentowa składki wypadkowej wynosi 1,93%.
    ###
    # public variables
    @name = "Calculator GrossNet"

    # private variables
    disabilityFactor    = @options.disabilityFactor || 0.015
    healthFactor        = @options.healthFactor || 0.09
    incomeCost          = @options.incomeCost || 111.25
    pensionFactor       = @options.pensionFactor || 0.0976
    sicknessFactor      = @options.sicknessFactor || 0.0245
    taxFactor           = @options.taxFactor || 0.0775
    baseTaxFactor       = @options.baseTaxFactor || 0.18
    taxReductorConstant = @options.taxReductorConstant || 46.33
    basicCostOfRevenues = @options.basicCostOfRevenues || 111.25


    # protected methods
    @getPensionFactor       = -> pensionFactor
    @getDisabilityFactor    = -> disabilityFactor
    @getSicknessFactor      = -> sicknessFactor
    @getHealthFactor        = -> healthFactor
    @getTaxFactor           = -> taxFactor
    @getBaseTaxFactor       = -> baseTaxFactor
    @getTaxReductorConstant = -> taxReductorConstant
    @getIncomeCost          = -> incomeCost

  test: ->
    "#{@name} => counting net salary from gross amount of #{@gross} pln"

  getPensionInsurance: ( asString ) ->
    result = @.round @gross * @getPensionFactor(), 2
    if asString then @.toPrecision result else result

  getDisabilityInsurance: ( asString ) ->
    result = @.round @gross * @getDisabilityFactor(), 2
    if asString then @.toPrecision result else result

  getSicknessInsurance: ( asString ) ->
    result = @.round @gross * @getSicknessFactor(), 2
    if asString then @.toPrecision result else result

  getSumOfInsurances: ( asString ) ->
    result = @.getPensionInsurance() + @.getDisabilityInsurance() + @.getSicknessInsurance()
    if asString then @.toPrecision result else result

  # podstawa wymiaru składki na ubezpieczenie zdrowotne (gross - sum of insurances)
  getBaseForHealthInsurance: ->
    @gross - @getSumOfInsurances()

  # składka na ubezpieczenie zdrowotne do pobrania z wynagrodzenia (data.baseHealth x 9%)
  getAmountForHealthInsurance: ->
    @.round @.getBaseForHealthInsurance() * @.getHealthFactor(), 2

  # składka na ubezpieczenie zdrowotne do odliczenia od podatku (data.baseHealth x 7,75%)
  getAmountForHealthInsuranceToTax: ->
    @.round( @.getBaseForHealthInsurance() * @.getTaxFactor(), 2)

  # podstawa obliczenia zaliczki na podatek dochodowy, po zaokrągleniu do pełnych złotych (gross - incomeCost - sum of insurances)
  getBaseForIncomeTax: ->
    Math.floor @gross - @.getIncomeCost() - @.getSumOfInsurances()

  # zaliczka na podatek dochodowy przed odliczeniem składki zdrowotnej [(baseForIncomeTax x 18%) - 46,33 zł]
  getAdvanceForIncomeTaxBeforeHealth: ->
    @.round @.getBaseForIncomeTax() * @.getBaseTaxFactor() - @.getTaxReductorConstant(), 2

  # zaliczka na podatek dochodowy do pobrania, po zaokrągleniu do pełnych złotych (advanceFITBH - amountForHITT)
  getAdvanceForIncomeTax: ->
    Math.floor @.getAdvanceForIncomeTaxBeforeHealth() - @.getAmountForHealthInsuranceToTax(), 2

  # kwota do wypłaty (gross - suma ubezpieczen - składka na zdrowotne do pobrania z wynagrodzenia - zaliczka na podatek)
  getNet: ->
    @.round @gross - @.getSumOfInsurances() - @.getAmountForHealthInsurance() - @.getAdvanceForIncomeTax(), 2

  ###
    składki obciążające pracodawcę od kwoty 1.500 zł:
    składka pension 9,76%, tj. 146,40 zł
    + składka disability 6,5%, tj. 97,50 zł
    + składka wypadkowa 1,93%, tj. 28,95 zł
    + składka na FP 2,45%, tj. 36,75 zł
    + składka na FGŚP 0,10%, tj. 1,50 zł)
    311,10 zł

    razem koszt pracodawcy (poz. a + poz. l) 1.811,10 zł
  ###
  getEmployerCosts: ->
    @gross * 0.0976 + @gross * 0.065 + @gross * 0.0193 + @gross * 0.0245 + @gross * 0.001

  getTotalEmployerCosts: ->
    @.getEmployerCosts() + @gross


# calc = new Calculator()
# calc.test 'test'

# gn = new GrossNet 1500

# console.log gn.test()

# console.log gn.getPension()
# console.log gn.getDisability()
# console.log gn.getSickness()

# console.log 'getPensionInsurance', gn.getPensionInsurance()
# console.log 'getDisabilityInsurance', gn.getDisabilityInsurance()
# console.log 'getSicknessInsurance', gn.getSicknessInsurance()
# console.log 'as number', gn.getSumOfInsurances()
# console.log 'as string', gn.getSumOfInsurances true

# console.log 'getBaseForHealthInsurance', gn.getBaseForHealthInsurance()
# console.log 'getAmountForHealthInsurance', gn.getAmountForHealthInsurance()
# console.log 'getAmountForHealthInsuranceToTax', gn.getAmountForHealthInsuranceToTax()
# console.log 'getBaseForIncomeTax', gn.getBaseForIncomeTax()
# console.log 'getAdvanceForIncomeTaxBeforeHealth', gn.getAdvanceForIncomeTaxBeforeHealth()
# console.log 'getAdvanceForIncomeTax', gn.getAdvanceForIncomeTax()
# console.log 'getNet', gn.getNet()
# console.log 'getEmployerCosts', gn.getEmployerCosts()
# console.log 'getTotalEmployerCosts', gn.getTotalEmployerCosts()