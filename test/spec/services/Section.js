'use strict';

/**
* Module with tests for the Section factory.
*
* @module Section factory tests
*/

describe('Factory: Section', function () {

    var Section,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Section_, _$httpBackend_) {
        Section = _Section_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                number: 1,
                title: 'Section 1',
            };
        });

        it('returns a Section instance', function () {
            var instance = Section.createFromApiData(data);
            expect(instance instanceof Section).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Section.createFromApiData(data);
                expect(instance.number).toEqual(1);
                expect(instance.title).toEqual('Section 1');
            }
        );
    });

    describe('getAll() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                items: [
                    {number: 5, title: 'section 5'},
                    {number: 2, title: 'section 2'},
                    {number: 9, title: 'section 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_sections_getsections',
                {}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Section.getAll();
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Section.getAll();
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Section.getAll();
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Section instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Section.getAll();
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Section).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Section.getAll();
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Section.getAll();
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
