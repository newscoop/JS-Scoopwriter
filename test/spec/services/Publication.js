'use strict';

/**
* Module with tests for the Publication factory.
*
* @module Publication factory tests
*/

describe('Factory: Publication', function () {

    var Publication,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Publication_, _$httpBackend_) {
        Publication = _Publication_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                id: 1,
                name: 'Publication 1',
            };
        });

        it('returns a Publication instance', function () {
            var instance = Publication.createFromApiData(data);
            expect(instance instanceof Publication).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Publication.createFromApiData(data);
                expect(instance.id).toEqual(1);
                expect(instance.name).toEqual('Publication 1');
            }
        );
    });

    describe('getAll() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                items: [
                    {id: 5, name: 'publication 5'},
                    {id: 2, name: 'publication 2'},
                    {id: 9, name: 'publication 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_publications_getpublications',
                {}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Publication.getAll();
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Publication.getAll();
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Publication.getAll();
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Publication instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Publication.getAll();
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Publication).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Publication.getAll();
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Publication.getAll();
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
