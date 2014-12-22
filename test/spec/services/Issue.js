'use strict';

/**
* Module with tests for the Issue factory.
*
* @module Issue factory tests
*/

describe('Factory: Issue', function () {

    var Issue,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Issue_, _$httpBackend_) {
        Issue = _Issue_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                number: 1,
                title: 'Issue 1',
            };
        });

        it('returns a Issue instance', function () {
            var instance = Issue.createFromApiData(data);
            expect(instance instanceof Issue).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Issue.createFromApiData(data);
                expect(instance.number).toEqual(1);
                expect(instance.title).toEqual('Issue 1');
            }
        );
    });

    describe('getAll() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                items: [
                    {number: 5, title: 'issue 5'},
                    {number: 2, title: 'issue 2'},
                    {number: 9, title: 'issue 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_issues_getissues',
                {}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Issue.getAll();
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Issue.getAll();
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Issue.getAll();
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Issue instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Issue.getAll();
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Issue).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Issue.getAll();
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Issue.getAll();
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });
    });

});
