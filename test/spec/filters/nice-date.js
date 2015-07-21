'use strict';

describe('Filter: niceDate', function () {

    // load the filter's module
    beforeEach(module('authoringEnvironmentApp'));

    // initialize a new instance of the filter before each test
    var niceDate;
    beforeEach(inject(function ($filter, currentTime) {
        niceDate = $filter('niceDate');
        currentTime.set(new Date('Fri Mar 21 2014 16:02:58 GMT+0100 (CET)'));
    }));

    it('should return the hour if a date belongs to today', function () {
        var date = new Date('Fri Mar 21 2014 14:02:58 GMT+0100 (CET)');
        var utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        expect(niceDate(utc)).toBe('today 13:02');
    });
    it('should return the day of any hour from yesterday on', function() {
        var date = new Date('Fri Mar 20 2014 14:02:58 GMT+0100 (CET)');
        var utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        expect(niceDate(utc)).toBe('20.03.2014');
    });
    it('should return the day of any hour from yesterday on, padded', function() {
        var date = new Date('Fri Mar 04 2014 14:02:58 GMT+0100 (CET)');
        var utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        expect(niceDate(utc)).toBe('04.03.2014');
    });
    it('behaves well with a JSON date', function() {
        var date = "2014-02-13T16:05:34+0000";
        expect(niceDate(date)).toBe('13.02.2014');
    });

});
