'use strict';

/**
* Module with tests for the Slideshow factory.
*
* @module Slideshow factory tests
*/

describe('Factory: Slideshow', function () {

    var Slideshow,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Slideshow_, _$httpBackend_) {
        Slideshow = _Slideshow_;
        $httpBackend = _$httpBackend_;
    }));

    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            // NOTE: have integers as strings to test data conversion
            data = {
                id: "1",
                title: "Test Slideshow",
                itemsCount: "2",
                items: [{
                    "caption": "That's how they do it",
                    "type": "image",
                    "link": "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000131.jpg"
                },
                {
                    "type": "video",
                    "link": "https://www.youtu.be/WhVtNNotBuq"
                }]
            };
        });

        it('returns a Slideshow instance', function () {
            var instance = Slideshow.createFromApiData(data);
            expect(instance instanceof Slideshow).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Slideshow.createFromApiData(data);
                expect(instance.id).toEqual(1);
                expect(instance.title).toEqual('Test Slideshow');
                expect(instance.type).toEqual('image');
                expect(instance.cover).toEqual('http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000131.jpg');
            }
        );
    });

    describe('getAllByArticle() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                id: "1",
                title: "Test Slideshow",
                itemsCount: "2",
                items: [{
                    "caption": "That's how they do it",
                    "type": "image",
                    "link": "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000131.jpg"
                },
                {
                    "type": "video",
                    "link": "https://www.youtu.be/WhVtNNotBuq"
                }]
            };

            url = Routing.generate(
                'newscoop_gimme_articles_slideshows',
                {number: 64, language: 'en'}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Slideshow.getAllByArticle(64, 'en');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Slideshow.getAllByArticle(64, 'en');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(2);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Slideshow.getAllByArticle(64, 'en');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Slideshow instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Slideshow.getAllByArticle(64, 'en');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Slideshow).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Slideshow.getAllByArticle(64, 'en');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Slideshow.getAllByArticle(64, 'en');
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });
    });

    describe('removeFromArticle() method', function () {
        var slideshow,
            url;

        beforeEach(function () {
            var expectedLinkHeader,
                slideshowUri;

            slideshowUri = Routing.generate(
                'newscoop_gimme_slideshows_getslideshowitems', {id: 1}, false
            );
            expectedLinkHeader = '<' + slideshowUri + '; rel="slideshow">';

            slideshow = Object.create(Slideshow.prototype, {
                id: {value: 1, writable: true, enumerable: true}
            });

            url = Routing.generate(
                'newscoop_gimme_articles_unlinkarticle',
                {number: 64, language: 'en'}, true
            );

            $httpBackend.expect(
                'UNLINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(204, '');
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = slideshow.removeFromArticle(64, 'en')
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            slideshow.removeFromArticle(64, 'en')
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                slideshow.removeFromArticle(64, 'en')
                    .then(spyHelper.callMeOnSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var promise,
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('UNLINK', url).respond(500, 'Error :(');

            slideshow.removeFromArticle(64, 'en')
                .catch(spyHelper.callMeOnError);
            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

});
