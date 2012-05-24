'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('calculator', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });

  it('should automatically redirect to / when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/");
  });

  describe('index page', function() {

    beforeEach(function() {
      browser().navigateTo('#/');
    });


    it('should render index page when user navigates to /', function() {
      expect(element('[ng-view] p').text()).toMatch('Index file of Kalkulator');
    });

  });

  describe('brutto-netto page', function() {

    beforeEach(function() {
      browser().navigateTo('#/brutto-netto');
    });

    it('should render brutto-netto when user navigates to /brutto-netto', function() {
      expect(element('h2.pageTitle').text()).toMatch('Kalkulator wynagrodzenia brutto - netto');
    });

    it('should not display singleMonthResult table when page loads', function() {
      expect(element('#singleMonthResult').css('display')).toBe('none');
    });

    it('should not display multipleMonthsResult table when page loads', function() {
      expect(element('#multipleMonthsResult').css('display')).toBe('none');
    });

    it('input#amount should be empty', function() {
      expect(element('#amount').val()).toBe('');
    });

    it('button with class active should be the one with word Tak', function() {
      expect(element('.singleMonthContainer .active').text()).toBe('Tak');
    });

    it('second button should have word Nie', function() {
      expect(element('.singleMonthContainer button:nth-child(2)').text()).toBe('Nie');
    });

    it('should hide monthlyTable when user clicks on #radio1', function() {
      element('#radio1').click();
      // expect(element('#radio1').hasClass('active')).toBe(true);
      // expect(element('#radio2').hasClass('active')).not().toBe(true);
      expect(element('#monthlyTable').css('display')).toBe('none');
    });

    // describe('submit', function() {

    //   it('should count the net value when amount is given', function() {
    //     expect(element('td.net, #singleMonthResult').text()).not().toBe('');
    //   });

    // });

    describe('count for single month', function() {

      beforeEach(function() {
        browser().navigateTo('#/brutto-netto');
      });

      it('should count when input is a number greater than 99', function() {
        input('amount').enter(1500);
        element('#submit').click();
        expect(element('#singleMonthResult td.net').text()).toBe('1111.86');
      });

    });

    describe('count for multiple months', function() {

      beforeEach(function() {
        element('#radio2').click();
        input('amount').enter(1500);
        element('#submit').click();
      });

      it('should hide monthlyTable when user clicks on #radio1', function() {
        element('#radio1').click();
        // expect(element('#radio1').hasClass('active')).toBe(true);
        // expect(element('#radio2').hasClass('active')).not().toBe(true);
        expect(element('#monthlyTable').css('display')).toBe('none');
      });

      it('should select radio2 and radio1 should not be selected when user clicks on #radio2', function() {
        // expect(element('#radio2').attr('checked')).toBe('checked');
        // expect(element('#radio1').attr('checked')).toBe(undefined);
      });

      it('should show multipleMonthsResult table', function() {
        expect(element('#multipleMonthsResult').css('display')).toBe('table');
      });

      it('should hide monthlyTable table and show button to modify each month', function() {
        expect(element('#monthlyTable').css('display')).toBe('none');
        expect(element('#modifyInput').css('display')).toBe('inline-block');
      });

    });

    describe('changing from one month to multiple months', function() {

      beforeEach(function() {
        element('#radio2').click();
      });

      it('should hide singleMonthResult table when #radio2 is pressed', function() {
        expect(element('#singleMonthResult').css('display')).toBe('none');
      });

      it('should show table for each month when #radio2 is selected', function() {
        expect(element('#monthlyTable').css('display')).toBe('table');
      });

    });

    describe('changing from one month to multiple months after counting single month', function() {

      beforeEach(function() {
        input('amount').enter(1500);
        element('#submit').click();
        element('#radio2').click();
      });

      it('should hide singleMonthResult table if prev calculations were made', function() {
        expect(element('#singleMonthResult').css('display')).toBe('none');
      });

    });

    describe('changing from multiple months to one month after counting multiple months', function() {

      beforeEach(function() {
        element('#radio2').click();
        input('amount').enter(1500);
        element('#submit').click();
        element('#radio1').click();
      });

      it('should hide multipleMonthsResult table', function() {
        expect(element('#multipleMonthsResult').css('display')).toBe('none');
      });

      it('should hide the modifyInput button', function() {
        expect(element('#modifyInput').css('display')).toBe('none');
      });

    });

  });
});
