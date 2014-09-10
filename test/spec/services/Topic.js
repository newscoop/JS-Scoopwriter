'use strict';

/**
* Module with tests for the Topic factory.
*
* @module Topic factory tests
*/

describe('Factory: Topic', function () {

    var Topic,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Topic_, _$httpBackend_) {
        Topic = _Topic_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {id: 5, title: 'Sports'};
        });

        it('returns a Topic instance', function () {
            var instance = Topic.createFromApiData(data);
            expect(instance instanceof Topic).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Topic.createFromApiData(data);
                expect(instance.id).toEqual(5);
                expect(instance.title).toEqual('Sports');
            }
        );
    });

    describe('getAllByArticle() method', function () {
        var url,
            response,
            topics;

        beforeEach(function () {
            topics = [
                {id: 5, name: 'topic 5'},
                {id: 2, name: 'topic 2'},
                {id: 9, name: 'topic 9'}
            ];

            response = {
                title: 'Article title',
                number: 7,
                topics: topics
            };

            url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: 7, language: 'it'}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Topic.getAllByArticle(7, 'it');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Topic.getAllByArticle(7, 'it');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Topic instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Topic).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Topic.getAllByArticle(7, 'it');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
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
